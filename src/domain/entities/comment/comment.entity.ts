// src/domain/entities/comment/comment.entity.ts - CORRIGIDO
import { Entity } from '@/domain/shared/entities/entity';
import { CommentValidatorFactory } from '@/domain/factories/comment/comment.validator.factory';

export type CommentTarget = 'ARTICLE' | 'PROJECT' | 'ISSUE' | 'QA';

export type CommentProps = {
  id?: string;
  content: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  authorId: string;
  parentId?: string | null;
  repliesCount?: number;
  targetId: string;
  targetType: CommentTarget;
  approved?: boolean;
  approvedById?: string | null;
  approvedAt?: Date | null;
  rejectionReason?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export class Comment extends Entity {
  private content: string;
  private isEdited: boolean;
  private isDeleted: boolean;
  private authorId: string;
  private parentId: string | null;
  private repliesCount: number;
  private targetId: string;
  private targetType: CommentTarget;
  private approved: boolean;
  private approvedById: string | null;
  private approvedAt: Date | null;
  private rejectionReason: string | null;

  constructor(props: CommentProps) {
    // ✅ CORRIGIDO: Passar createdAt e updatedAt para Entity
    super(
      props.id ?? '', 
      props.createdAt || new Date(), 
      props.updatedAt || new Date(), 
      true // isActive sempre true para comentários
    );
    
    this.content = props.content?.trim() || '';
    this.isEdited = props.isEdited || false;
    this.isDeleted = props.isDeleted || false;
    this.authorId = props.authorId;
    this.parentId = props.parentId || null;
    this.repliesCount = props.repliesCount || 0;
    this.targetId = props.targetId;
    this.targetType = props.targetType;
    this.approved = props.approved !== undefined ? props.approved : true; // ✅ Por padrão aprovado
    this.approvedById = props.approvedById || null;
    this.approvedAt = props.approvedAt || null;
    this.rejectionReason = props.rejectionReason || null;
    
    this.validate();
  }

  // 🏭 Factory Methods
  public static create(props: Omit<CommentProps, 'id' | 'createdAt' | 'updatedAt'>): Comment {
    return new Comment({
      ...props,
      id: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public static with(props: CommentProps): Comment {
    return new Comment(props);
  }

  // 📝 Business Methods
  public edit(newContent: string): void {
    if (this.isDeleted) {
      throw new Error('Cannot edit deleted comment');
    }
    
    if (this.content.trim() === newContent.trim()) {
      return;
    }

    this.content = newContent.trim();
    this.isEdited = true;
    this.updatedAt = new Date();
    this.validate();
  }

  public softDelete(): void {
    this.isDeleted = true;
    this.content = '[Comentário removido]';
    this.updatedAt = new Date();
  }

  public approve(moderatorId: string): void {
    this.approved = true;
    this.approvedById = moderatorId;
    this.approvedAt = new Date();
    this.rejectionReason = null;
    this.updatedAt = new Date();
  }

  public reject(moderatorId: string, reason: string): void {
    this.approved = false;
    this.approvedById = moderatorId;
    this.approvedAt = new Date();
    this.rejectionReason = reason;
    this.updatedAt = new Date();
  }

  public incrementRepliesCount(): void {
    this.repliesCount += 1;
    this.updatedAt = new Date();
  }

  public decrementRepliesCount(): void {
    if (this.repliesCount > 0) {
      this.repliesCount -= 1;
      this.updatedAt = new Date();
    }
  }

  public isReply(): boolean {
    return this.parentId !== null;
  }

  public isRootComment(): boolean {
    return this.parentId === null;
  }

  public canBeEditedBy(userId: string): boolean {
    return this.authorId === userId && !this.isDeleted;
  }

  public canBeDeletedBy(userId: string, userRoles: string[]): boolean {
    return this.authorId === userId || userRoles.some(role => ['MODERATOR', 'ADMIN'].includes(role));
  }

  public canBeModeratedBy(userRoles: string[]): boolean {
    return userRoles.some(role => ['MODERATOR', 'ADMIN'].includes(role));
  }

  // 🔍 Getters
  public getId(): string {
    return this.id;
  }

  public getContent(): string {
    return this.content;
  }

  public getIsEdited(): boolean {
    return this.isEdited;
  }

  public getIsDeleted(): boolean {
    return this.isDeleted;
  }

  public getAuthorId(): string {
    return this.authorId;
  }

  public getParentId(): string | null {
    return this.parentId;
  }

  public getRepliesCount(): number {
    return this.repliesCount;
  }

  public getTargetId(): string {
    return this.targetId;
  }

  public getTargetType(): CommentTarget {
    return this.targetType;
  }

  public getApproved(): boolean {
    return this.approved;
  }

  public getApprovedById(): string | null {
    return this.approvedById;
  }

  public getApprovedAt(): Date | null {
    return this.approvedAt;
  }

  public getRejectionReason(): string | null {
    return this.rejectionReason;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // ✅ Validation
  protected validate(): void {
    const validator = CommentValidatorFactory.create();
    validator.validate(this);
  }

  // 📄 Serialization
  public toJSON() {
    return {
      id: this.id,
      content: this.content,
      isEdited: this.isEdited,
      isDeleted: this.isDeleted,
      authorId: this.authorId,
      parentId: this.parentId,
      repliesCount: this.repliesCount,
      targetId: this.targetId,
      targetType: this.targetType,
      approved: this.approved,
      approvedById: this.approvedById,
      approvedAt: this.approvedAt,
      rejectionReason: this.rejectionReason,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
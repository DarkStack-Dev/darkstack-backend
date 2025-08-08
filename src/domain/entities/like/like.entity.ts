// src/domain/entities/like/like.entity.ts
import { Entity } from '@/domain/shared/entities/entity';
import { LikeValidatorFactory } from '@/domain/factories/like/like.validator.factory';

export type LikeTarget = 'ARTICLE' | 'PROJECT' | 'COMMENT' | 'USER_PROFILE' | 'ISSUE' | 'QA';

export type LikeProps = {
  id?: string;
  userId: string;
  targetId: string;
  targetType: LikeTarget;
  isLike?: boolean; // true = like, false = dislike
  createdAt?: Date;
  updatedAt?: Date;
};

export class Like extends Entity {
  private userId: string;
  private targetId: string;
  private targetType: LikeTarget;
  private isLike: boolean;

  constructor(props: LikeProps) {
    super(
      props.id ?? '', 
      props.createdAt || new Date(), 
      props.updatedAt || new Date(), 
      true // isActive sempre true para likes
    );
    
    this.userId = props.userId;
    this.targetId = props.targetId;
    this.targetType = props.targetType;
    this.isLike = props.isLike !== undefined ? props.isLike : true; // Default: like
    
    this.validate();
  }

  // 🏭 Factory Methods
  public static create(props: Omit<LikeProps, 'id' | 'createdAt' | 'updatedAt'>): Like {
    return new Like({
      ...props,
      id: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public static with(props: LikeProps): Like {
    return new Like(props);
  }

  // 📝 Business Methods
  public toggleLike(): void {
    this.isLike = true;
    this.updatedAt = new Date();
    this.validate();
  }

  public toggleDislike(): void {
    this.isLike = false;
    this.updatedAt = new Date();
    this.validate();
  }

  public toggle(): void {
    this.isLike = !this.isLike;
    this.updatedAt = new Date();
    this.validate();
  }

  // 🔍 Query Methods
  public isLikeType(): boolean {
    return this.isLike === true;
  }

  public isDislikeType(): boolean {
    return this.isLike === false;
  }

  public belongsToUser(userId: string): boolean {
    return this.userId === userId;
  }

  public belongsToTarget(targetId: string, targetType: LikeTarget): boolean {
    return this.targetId === targetId && this.targetType === targetType;
  }

  // 🔍 Getters
  public getId(): string {
    return this.id;
  }

  public getUserId(): string {
    return this.userId;
  }

  public getTargetId(): string {
    return this.targetId;
  }

  public getTargetType(): LikeTarget {
    return this.targetType;
  }

  public getIsLike(): boolean {
    return this.isLike;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // ✅ Validation
  protected validate(): void {
    const validator = LikeValidatorFactory.create();
    validator.validate(this);
  }

  // 📄 Serialization
  public toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      targetId: this.targetId,
      targetType: this.targetType,
      isLike: this.isLike,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
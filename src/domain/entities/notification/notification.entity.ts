// src/domain/entities/notification/notification.entity.ts
import { Entity } from "@/domain/shared/entities/entity";
import { NotificationValidatorFactory } from "@/domain/factories/notification/notification.validator.factory";
import { Utils } from "@/shared/utils/utils";
import { NotificationType } from "generated/prisma";

export type NotificationCreateDto = {
  id?: string;
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  relatedId?: string;
  relatedType?: string;
  metadata?: any;
  createdById?: string;
};

export type NotificationWithDto = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  userId: string;
  relatedId?: string;
  relatedType?: string;
  metadata?: any;
  createdById?: string;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

export type NotificationUpdateDto = {
  isRead?: boolean;
  readAt?: Date;
  metadata?: any;
};

export class Notification extends Entity {
  private type: NotificationType;
  private title: string;
  private message: string;
  private isRead: boolean;
  private userId: string;
  private relatedId?: string;
  private relatedType?: string;
  private metadata?: any;
  private createdById?: string;
  private readAt?: Date;
  private deletedAt?: Date;

  protected constructor(
    id: string,
    type: NotificationType,
    title: string,
    message: string,
    isRead: boolean,
    userId: string,
    relatedId: string | undefined,
    relatedType: string | undefined,
    metadata: any,
    createdById: string | undefined,
    readAt: Date | undefined,
    createdAt: Date,
    updatedAt: Date,
    deletedAt?: Date
  ) {
    super(id, createdAt, updatedAt, true); // Notifications are always active
    this.type = type;
    this.title = title;
    this.message = message;
    this.isRead = isRead;
    this.userId = userId;
    this.relatedId = relatedId;
    this.relatedType = relatedType;
    this.metadata = metadata;
    this.createdById = createdById;
    this.readAt = readAt;
    this.deletedAt = deletedAt;
    this.validate();
  }

  public static create({
    id,
    type,
    title,
    message,
    userId,
    relatedId,
    relatedType,
    metadata,
    createdById,
  }: NotificationCreateDto): Notification {
    const entityId = id || Utils.GenerateUUID();
    const now = new Date();
    
    return new Notification(
      entityId,
      type,
      title.trim(),
      message.trim(),
      false, // Sempre não lida ao criar
      userId,
      relatedId,
      relatedType,
      metadata,
      createdById,
      undefined, // readAt
      now,
      now
    );
  }

  public static with({
    id,
    type,
    title,
    message,
    isRead,
    userId,
    relatedId,
    relatedType,
    metadata,
    createdById,
    readAt,
    createdAt,
    updatedAt,
    deletedAt,
  }: NotificationWithDto): Notification {
    return new Notification(
      id,
      type,
      title,
      message,
      isRead,
      userId,
      relatedId,
      relatedType,
      metadata,
      createdById,
      readAt,
      createdAt,
      updatedAt,
      deletedAt
    );
  }

  public update(updateData: NotificationUpdateDto): Notification {
    const updatedIsRead = updateData.isRead ?? this.isRead;
    const updatedReadAt = updateData.readAt ?? (updatedIsRead && !this.isRead ? new Date() : this.readAt);
    const updatedMetadata = updateData.metadata ?? this.metadata;
    
    return new Notification(
      this.id,
      this.type,
      this.title,
      this.message,
      updatedIsRead,
      this.userId,
      this.relatedId,
      this.relatedType,
      updatedMetadata,
      this.createdById,
      updatedReadAt,
      this.createdAt,
      new Date(),
      this.deletedAt
    );
  }

  public markAsRead(): Notification {
    if (this.isRead) {
      return this; // Já está lida
    }

    return this.update({
      isRead: true,
      readAt: new Date(),
    });
  }

  public markAsUnread(): Notification {
    if (!this.isRead) {
      return this; // Já está não lida
    }

    return this.update({
      isRead: false,
      readAt: undefined,
    });
  }

  public softDelete(): void {
    this.deletedAt = new Date();
  }

  protected validate(): void {
    NotificationValidatorFactory.create().validate(this);
  }

  // Factory methods para tipos específicos
  public static createArticlePending(articleId: string, articleTitle: string, moderatorIds: string[]): Notification[] {
    return moderatorIds.map(moderatorId => 
      Notification.create({
        type: NotificationType.ARTICLE_PENDING,
        title: 'Novo artigo aguardando moderação',
        message: `O artigo "${articleTitle}" foi enviado e aguarda sua aprovação.`,
        userId: moderatorId,
        relatedId: articleId,
        relatedType: 'ARTICLE',
        metadata: {
          articleTitle,
          action: 'moderate',
          url: `/moderation/articles/${articleId}`,
        },
      })
    );
  }

  public static createArticleApproved(articleId: string, articleTitle: string, authorId: string, moderatorId: string): Notification {
    return Notification.create({
      type: NotificationType.ARTICLE_APPROVED,
      title: 'Artigo aprovado! 🎉',
      message: `Seu artigo "${articleTitle}" foi aprovado e já está disponível para leitura.`,
      userId: authorId,
      relatedId: articleId,
      relatedType: 'ARTICLE',
      createdById: moderatorId,
      metadata: {
        articleTitle,
        action: 'view',
        url: `/articles/${articleId}`,
      },
    });
  }

  public static createArticleRejected(articleId: string, articleTitle: string, authorId: string, moderatorId: string, reason?: string): Notification {
    return Notification.create({
      type: NotificationType.ARTICLE_REJECTED,
      title: 'Artigo necessita ajustes',
      message: `Seu artigo "${articleTitle}" precisa de alguns ajustes antes da publicação.${reason ? ` Motivo: ${reason}` : ''}`,
      userId: authorId,
      relatedId: articleId,
      relatedType: 'ARTICLE',
      createdById: moderatorId,
      metadata: {
        articleTitle,
        rejectionReason: reason,
        action: 'edit',
        url: `/articles/${articleId}/edit`,
      },
    });
  }

  public static createProjectPending(projectId: string, projectName: string, moderatorIds: string[]): Notification[] {
    return moderatorIds.map(moderatorId => 
      Notification.create({
        type: NotificationType.PROJECT_PENDING,
        title: 'Novo projeto aguardando moderação',
        message: `O projeto "${projectName}" foi enviado e aguarda sua aprovação.`,
        userId: moderatorId,
        relatedId: projectId,
        relatedType: 'PROJECT',
        metadata: {
          projectName,
          action: 'moderate',
          url: `/moderation/projects/${projectId}`,
        },
      })
    );
  }

  public static createProjectApproved(projectId: string, projectName: string, authorId: string, moderatorId: string): Notification {
    return Notification.create({
      type: NotificationType.PROJECT_APPROVED,
      title: 'Projeto aprovado! 🎉',
      message: `Seu projeto "${projectName}" foi aprovado e já está visível na galeria.`,
      userId: authorId,
      relatedId: projectId,
      relatedType: 'PROJECT',
      createdById: moderatorId,
      metadata: {
        projectName,
        action: 'view',
        url: `/projects/${projectId}`,
      },
    });
  }

  public static createProjectRejected(projectId: string, projectName: string, authorId: string, moderatorId: string, reason?: string): Notification {
    return Notification.create({
      type: NotificationType.PROJECT_REJECTED,
      title: 'Projeto necessita ajustes',
      message: `Seu projeto "${projectName}" precisa de alguns ajustes antes da publicação.${reason ? ` Motivo: ${reason}` : ''}`,
      userId: authorId,
      relatedId: projectId,
      relatedType: 'PROJECT',
      createdById: moderatorId,
      metadata: {
        projectName,
        rejectionReason: reason,
        action: 'edit',
        url: `/projects/${projectId}/edit`,
      },
    });
  }

  // Getters
  public getType(): NotificationType { return this.type; }
  public getTitle(): string { return this.title; }
  public getMessage(): string { return this.message; }
  public getIsRead(): boolean { return this.isRead; }
  public getUserId(): string { return this.userId; }
  public getRelatedId(): string | undefined { return this.relatedId; }
  public getRelatedType(): string | undefined { return this.relatedType; }
  public getMetadata(): any { return this.metadata; }
  public getCreatedById(): string | undefined { return this.createdById; }
  public getReadAt(): Date | undefined { return this.readAt; }
  public getDeletedAt(): Date | undefined { return this.deletedAt; }

  // Helper methods
  public isUnread(): boolean { return !this.isRead; }
  public isForUser(userId: string): boolean { return this.userId === userId; }
  public isRelatedTo(id: string, type: string): boolean { 
    return this.relatedId === id && this.relatedType === type; 
  }
  public hasMetadata(): boolean { return !!this.metadata; }
}
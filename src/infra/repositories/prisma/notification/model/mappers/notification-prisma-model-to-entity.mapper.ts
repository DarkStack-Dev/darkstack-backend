// src/infra/repositories/prisma/notification/model/mappers/notification-prisma-model-to-entity.mapper.ts
import { Notification } from '@/domain/entities/notification/notification.entity';

export class NotificationPrismaModelToEntityMapper {
  public static map(model: any): Notification {
    return Notification.with({
      id: model.id,
      type: model.type,
      title: model.title,
      message: model.message,
      isRead: model.isRead,
      userId: model.userId,
      relatedId: model.relatedId,
      relatedType: model.relatedType,
      metadata: model.metadata,
      createdById: model.createdById,
      readAt: model.readAt,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt,
    });
  }
}

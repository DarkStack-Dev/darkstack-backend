// src/infra/repositories/prisma/notification/model/mappers/notification-entity-to-prisma-model.mapper.ts
import { Notification } from '@/domain/entities/notification/notification.entity';

export class NotificationEntityToPrismaModelMapper {
  public static map(notification: Notification) {
    return {
      id: notification.getId(),
      type: notification.getType(),
      title: notification.getTitle(),
      message: notification.getMessage(),
      isRead: notification.getIsRead(),
      userId: notification.getUserId(),
      relatedId: notification.getRelatedId(),
      relatedType: notification.getRelatedType(),
      metadata: notification.getMetadata(),
      createdById: notification.getCreatedById(),
      readAt: notification.getReadAt(),
      createdAt: notification.getCreatedAt(),
      updatedAt: notification.getUpdatedAt(),
      deletedAt: notification.getDeletedAt(),
    };
  }
}
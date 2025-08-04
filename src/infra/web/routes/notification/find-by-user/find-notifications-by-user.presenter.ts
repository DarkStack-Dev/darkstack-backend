// src/infra/web/routes/notification/find-by-user/find-notifications-by-user.presenter.ts
import { FindNotificationsByUserOutput } from '@/usecases/notification/find-by-user/find-notifications-by-user.usecase';
import { FindNotificationsByUserResponse } from './find-notifications-by-user.dto';

export class FindNotificationsByUserPresenter {
  public static toHttp(output: FindNotificationsByUserOutput): FindNotificationsByUserResponse {
    return {
      notifications: output.notifications.map(notification => ({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        relatedId: notification.relatedId,
        relatedType: notification.relatedType,
        metadata: notification.metadata,
        readAt: notification.readAt,
        createdAt: notification.createdAt,
      })),
      total: output.total,
      unreadCount: output.unreadCount,
      page: output.page,
      hasNext: output.hasNext,
      hasPrevious: output.hasPrevious,
    };
  }
}
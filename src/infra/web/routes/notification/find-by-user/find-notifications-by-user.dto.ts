
// src/infra/web/routes/notification/find-by-user/find-notifications-by-user.dto.ts
export type FindNotificationsByUserRequest = {
  isRead?: boolean;
  limit?: number;
  offset?: number;
};

export type NotificationResponse = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string;
  relatedType?: string;
  metadata?: any;
  readAt?: Date;
  createdAt: Date;
};

export type FindNotificationsByUserResponse = {
  notifications: NotificationResponse[];
  total: number;
  unreadCount: number;
  page: number;
  hasNext: boolean;
  hasPrevious: boolean;
};
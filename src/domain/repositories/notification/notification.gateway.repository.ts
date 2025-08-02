// src/domain/repositories/notification/notification.gateway.repository.ts
import { Notification } from "@/domain/entities/notification/notification.entity";
import { NotificationType } from "generated/prisma";

export type NotificationSearchFilters = {
  userId?: string;
  type?: NotificationType;
  isRead?: boolean;
  relatedId?: string;
  relatedType?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'readAt';
  sortOrder?: 'asc' | 'desc';
};

export type PaginatedNotificationResult = {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type NotificationStatsResult = {
  totalNotifications: number;
  unreadNotifications: number;
  readNotifications: number;
  notificationsByType: Record<NotificationType, number>;
  recentNotificationsCount: number; // Últimas 24h
};

export abstract class NotificationGatewayRepository {
  // CRUD básico
  abstract findById(id: string): Promise<Notification | null>;
  abstract findAll(filters?: NotificationSearchFilters): Promise<PaginatedNotificationResult>;
  abstract create(notification: Notification): Promise<void>;
  abstract createMany(notifications: Notification[]): Promise<void>;
  abstract update(notification: Notification): Promise<void>;
  abstract softDelete(id: string): Promise<void>;
  abstract hardDelete(id: string): Promise<void>;

  // Métodos específicos do usuário
  abstract findByUserId(userId: string, filters?: Partial<NotificationSearchFilters>): Promise<PaginatedNotificationResult>;
  abstract findUnreadByUserId(userId: string): Promise<Notification[]>;
  abstract countUnreadByUserId(userId: string): Promise<number>;
  abstract markAsReadByUserId(userId: string, notificationIds: string[]): Promise<void>;
  abstract markAllAsReadByUserId(userId: string): Promise<void>;

  // Métodos por tipo
  abstract findByType(type: NotificationType, filters?: Partial<NotificationSearchFilters>): Promise<Notification[]>;
  abstract findByRelated(relatedId: string, relatedType: string): Promise<Notification[]>;

  // Estatísticas
  abstract getStatsByUserId(userId: string): Promise<NotificationStatsResult>;
  abstract countNotificationsByType(): Promise<Record<NotificationType, number>>;
  abstract getRecentNotifications(userId: string, hours: number): Promise<Notification[]>;

  // Limpeza
  abstract deleteReadOlderThan(days: number): Promise<number>;
  abstract deleteAllOlderThan(days: number): Promise<number>;

  // Verificações
  abstract existsUnreadForUser(userId: string): Promise<boolean>;
  abstract hasNotificationForRelated(userId: string, relatedId: string, relatedType: string): Promise<boolean>;
}
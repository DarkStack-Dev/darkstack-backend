// src/infra/repositories/prisma/notification/notification.prisma.repository.ts
import { Injectable } from '@nestjs/common';
import { NotificationGatewayRepository, NotificationSearchFilters, PaginatedNotificationResult, NotificationStatsResult } from '@/domain/repositories/notification/notification.gateway.repository';
import { Notification } from '@/domain/entities/notification/notification.entity';
import { prismaClient } from '../client.prisma';
import { NotificationPrismaModelToEntityMapper } from './model/mappers/notification-prisma-model-to-entity.mapper';
import { NotificationEntityToPrismaModelMapper } from './model/mappers/notification-entity-to-prisma-model.mapper';
import { NotificationType } from 'generated/prisma';

@Injectable()
export class NotificationPrismaRepository extends NotificationGatewayRepository {
  
  async findById(id: string): Promise<Notification | null> {
    const model = await prismaClient.notification.findUnique({
      where: { id, deletedAt: null },
      include: {
        user: true,
        createdBy: true,
      },
    });

    return model ? NotificationPrismaModelToEntityMapper.map(model) : null;
  }

  async findAll(filters?: NotificationSearchFilters): Promise<PaginatedNotificationResult> {
    const {
      userId,
      type,
      isRead,
      relatedId,
      relatedType,
      createdAfter,
      createdBefore,
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters || {};

    const where: any = {
      deletedAt: null,
    };

    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (isRead !== undefined) where.isRead = isRead;
    if (relatedId) where.relatedId = relatedId;
    if (relatedType) where.relatedType = relatedType;

    if (createdAfter || createdBefore) {
      where.createdAt = {};
      if (createdAfter) where.createdAt.gte = createdAfter;
      if (createdBefore) where.createdAt.lte = createdBefore;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prismaClient.notification.findMany({
        where,
        include: {
          user: true,
          createdBy: true,
        },
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: offset,
      }),
      prismaClient.notification.count({ where }),
      userId ? prismaClient.notification.count({ 
        where: { ...where, isRead: false } 
      }) : 0,
    ]);

    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return {
      notifications: notifications.map(NotificationPrismaModelToEntityMapper.map),
      total,
      unreadCount,
      page,
      pageSize: limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  async create(notification: Notification): Promise<void> {
    const data = NotificationEntityToPrismaModelMapper.map(notification);
    await prismaClient.notification.create({ data });
  }

  async createMany(notifications: Notification[]): Promise<void> {
    if (notifications.length === 0) return;

    const data = notifications.map(NotificationEntityToPrismaModelMapper.map);
    await prismaClient.notification.createMany({ data });
  }

  async update(notification: Notification): Promise<void> {
    const data = NotificationEntityToPrismaModelMapper.map(notification);
    await prismaClient.notification.update({
      where: { id: notification.getId() },
      data,
    });
  }

  async softDelete(id: string): Promise<void> {
    await prismaClient.notification.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async hardDelete(id: string): Promise<void> {
    await prismaClient.notification.delete({
      where: { id },
    });
  }

  async findByUserId(userId: string, filters?: Partial<NotificationSearchFilters>): Promise<PaginatedNotificationResult> {
    return this.findAll({
      ...filters,
      userId,
    });
  }

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    const models = await prismaClient.notification.findMany({
      where: {
        userId,
        isRead: false,
        deletedAt: null,
      },
      include: {
        user: true,
        createdBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return models.map(NotificationPrismaModelToEntityMapper.map);
  }

  async countUnreadByUserId(userId: string): Promise<number> {
    return prismaClient.notification.count({
      where: {
        userId,
        isRead: false,
        deletedAt: null,
      },
    });
  }

  async markAsReadByUserId(userId: string, notificationIds: string[]): Promise<void> {
    const now = new Date();
    await prismaClient.notification.updateMany({
      where: {
        userId,
        id: { in: notificationIds },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: now,
        updatedAt: now,
      },
    });
  }

  async markAllAsReadByUserId(userId: string): Promise<void> {
    const now = new Date();
    await prismaClient.notification.updateMany({
      where: {
        userId,
        isRead: false,
        deletedAt: null,
      },
      data: {
        isRead: true,
        readAt: now,
        updatedAt: now,
      },
    });
  }

  async findByType(type: NotificationType, filters?: Partial<NotificationSearchFilters>): Promise<Notification[]> {
    const models = await prismaClient.notification.findMany({
      where: {
        type,
        deletedAt: null,
        ...filters,
      },
      include: {
        user: true,
        createdBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return models.map(NotificationPrismaModelToEntityMapper.map);
  }

  async findByRelated(relatedId: string, relatedType: string): Promise<Notification[]> {
    const models = await prismaClient.notification.findMany({
      where: {
        relatedId,
        relatedType,
        deletedAt: null,
      },
      include: {
        user: true,
        createdBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return models.map(NotificationPrismaModelToEntityMapper.map);
  }

  async getStatsByUserId(userId: string): Promise<NotificationStatsResult> {
    const [
      totalNotifications,
      unreadNotifications,
      typeStats,
      recentCount,
    ] = await Promise.all([
      prismaClient.notification.count({
        where: { userId, deletedAt: null },
      }),
      prismaClient.notification.count({
        where: { userId, isRead: false, deletedAt: null },
      }),
      prismaClient.notification.groupBy({
        by: ['type'],
        where: { userId, deletedAt: null },
        _count: true,
      }),
      prismaClient.notification.count({
        where: {
          userId,
          deletedAt: null,
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    const notificationsByType = {} as Record<NotificationType, number>;
    Object.values(NotificationType).forEach(type => {
      notificationsByType[type] = 0;
    });
    typeStats.forEach(stat => {
      notificationsByType[stat.type] = stat._count;
    });

    return {
      totalNotifications,
      unreadNotifications,
      readNotifications: totalNotifications - unreadNotifications,
      notificationsByType,
      recentNotificationsCount: recentCount,
    };
  }

  async countNotificationsByType(): Promise<Record<NotificationType, number>> {
    const typeStats = await prismaClient.notification.groupBy({
      by: ['type'],
      where: { deletedAt: null },
      _count: true,
    });

    const result = {} as Record<NotificationType, number>;
    Object.values(NotificationType).forEach(type => {
      result[type] = 0;
    });
    typeStats.forEach(stat => {
      result[stat.type] = stat._count;
    });

    return result;
  }

  async getRecentNotifications(userId: string, hours: number): Promise<Notification[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const models = await prismaClient.notification.findMany({
      where: {
        userId,
        deletedAt: null,
        createdAt: { gte: since },
      },
      include: {
        user: true,
        createdBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return models.map(NotificationPrismaModelToEntityMapper.map);
  }

  async deleteReadOlderThan(days: number): Promise<number> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const result = await prismaClient.notification.deleteMany({
      where: {
        isRead: true,
        createdAt: { lt: cutoffDate },
      },
    });

    return result.count;
  }

  async deleteAllOlderThan(days: number): Promise<number> {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const result = await prismaClient.notification.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    return result.count;
  }

  async existsUnreadForUser(userId: string): Promise<boolean> {
    const count = await prismaClient.notification.count({
      where: {
        userId,
        isRead: false,
        deletedAt: null,
      },
      take: 1,
    });

    return count > 0;
  }

  async hasNotificationForRelated(userId: string, relatedId: string, relatedType: string): Promise<boolean> {
    const count = await prismaClient.notification.count({
      where: {
        userId,
        relatedId,
        relatedType,
        deletedAt: null,
      },
      take: 1,
    });

    return count > 0;
  }
}

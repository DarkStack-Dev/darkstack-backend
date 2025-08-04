// src/domain/usecases/notification/find-by-user/find-notifications-by-user.usecase.ts
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { NotificationGatewayRepository } from '@/domain/repositories/notification/notification.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { UserNotFoundUsecaseException } from '../../exceptions/user/user-not-found.usecase.exception';

export type FindNotificationsByUserInput = {
  userId: string;
  isRead?: boolean;
  limit?: number;
  offset?: number;
};

export type NotificationOutput = {
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

export type FindNotificationsByUserOutput = {
  notifications: NotificationOutput[];
  total: number;
  unreadCount: number;
  page: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

@Injectable()
export class FindNotificationsByUserUseCase implements UseCase<FindNotificationsByUserInput, FindNotificationsByUserOutput> {
  constructor(
    private readonly notificationRepository: NotificationGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
  ) {}

  async execute({ userId, isRead, limit = 20, offset = 0 }: FindNotificationsByUserInput): Promise<FindNotificationsByUserOutput> {
    // Verificar se usuário existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundUsecaseException(
        `User not found with id ${userId}`,
        'Usuário não encontrado',
        FindNotificationsByUserUseCase.name,
      );
    }

    // Buscar notificações
    const result = await this.notificationRepository.findByUserId(userId, {
      isRead,
      limit,
      offset,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    return {
      notifications: result.notifications.map(notification => ({
        id: notification.getId(),
        type: notification.getType(),
        title: notification.getTitle(),
        message: notification.getMessage(),
        isRead: notification.getIsRead(),
        relatedId: notification.getRelatedId(),
        relatedType: notification.getRelatedType(),
        metadata: notification.getMetadata(),
        readAt: notification.getReadAt(),
        createdAt: notification.getCreatedAt(),
      })),
      total: result.total,
      unreadCount: result.unreadCount,
      page: result.page,
      hasNext: result.hasNext,
      hasPrevious: result.hasPrevious,
    };
  }
}
// src/domain/usecases/notification/create-many/create-many-notifications.usecase.ts
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { NotificationGatewayRepository } from '@/domain/repositories/notification/notification.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { Notification } from '@/domain/entities/notification/notification.entity';
import { NotificationType } from 'generated/prisma';

export type CreateManyNotificationsInput = {
  type: NotificationType;
  title: string;
  message: string;
  userIds: string[];
  relatedId?: string;
  relatedType?: string;
  metadata?: any;
  createdById?: string;
};

export type CreateManyNotificationsOutput = {
  createdCount: number;
  failedUserIds: string[];
};

@Injectable()
export class CreateManyNotificationsUseCase implements UseCase<CreateManyNotificationsInput, CreateManyNotificationsOutput> {
  constructor(
    private readonly notificationRepository: NotificationGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
  ) {}

  async execute(input: CreateManyNotificationsInput): Promise<CreateManyNotificationsOutput> {
    const { userIds, ...notificationData } = input;
    const validUserIds: string[] = [];
    const failedUserIds: string[] = [];

    // Verificar quais usuários existem
    for (const userId of userIds) {
      const user = await this.userRepository.findById(userId);
      if (user && user.getIsActivate()) {
        validUserIds.push(userId);
      } else {
        failedUserIds.push(userId);
      }
    }

    // Criar notificações para usuários válidos
    const notifications = validUserIds.map(userId => 
      Notification.create({
        ...notificationData,
        userId,
      })
    );

    if (notifications.length > 0) {
      await this.notificationRepository.createMany(notifications);
    }

    return {
      createdCount: notifications.length,
      failedUserIds,
    };
  }
}
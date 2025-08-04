// src/domain/usecases/notification/mark-as-read/mark-notification-as-read.usecase.ts - WEBSOCKET VERSION
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { NotificationGatewayRepository } from '@/domain/repositories/notification/notification.gateway.repository';
import { NotificationNotFoundUsecaseException } from '../../exceptions/notification/notification-not-found.usecase.exception';
import { UnauthorizedUsecaseException } from '../../exceptions/auth/unauthorized.usecase.exception';
import { NotificationGateway } from '@/infra/websocket/notification.gateway';

export type MarkNotificationAsReadInput = {
  notificationId: string;
  userId: string;
};

export type MarkNotificationAsReadOutput = {
  id: string;
  isRead: boolean;
  readAt: Date;
  realTimeUpdated: boolean;
};

@Injectable()
export class MarkNotificationAsReadUseCase implements UseCase<MarkNotificationAsReadInput, MarkNotificationAsReadOutput> {
  constructor(
    private readonly notificationRepository: NotificationGatewayRepository,
    private readonly notificationGateway: NotificationGateway, // ✅ WEBSOCKET GATEWAY
  ) {}

  async execute({ notificationId, userId }: MarkNotificationAsReadInput): Promise<MarkNotificationAsReadOutput> {
    // Buscar notificação
    const notification = await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw new NotificationNotFoundUsecaseException(
        `Notification not found with id ${notificationId}`,
        'Notificação não encontrada',
        MarkNotificationAsReadUseCase.name,
      );
    }

    // Verificar se a notificação pertence ao usuário
    if (!notification.isForUser(userId)) {
      throw new UnauthorizedUsecaseException(
        `User ${userId} not authorized to read notification ${notificationId}`,
        'Você não tem permissão para acessar esta notificação',
        MarkNotificationAsReadUseCase.name,
      );
    }

    // Marcar como lida
    const updatedNotification = notification.markAsRead();
    await this.notificationRepository.update(updatedNotification);

    // ✅ NOTIFICAR EM TEMPO REAL VIA WEBSOCKET QUE NOTIFICAÇÃO FOI LIDA
    let realTimeUpdated = false;
    try {
      realTimeUpdated = this.notificationGateway.sendNotificationToUser(userId, {
        type: 'notificationRead',
        notificationId: updatedNotification.getId(),
        readAt: updatedNotification.getReadAt(),
        timestamp: new Date().toISOString(),
      });
      
      if (realTimeUpdated) {
        console.log(`✅ [MarkNotificationAsReadUseCase] Real-time update sent to user ${userId}`);
      }
    } catch (error) {
      console.error(`❌ [MarkNotificationAsReadUseCase] Failed to send real-time update:`, error);
    }

    return {
      id: updatedNotification.getId(),
      isRead: updatedNotification.getIsRead(),
      readAt: updatedNotification.getReadAt()!,
      realTimeUpdated,
    };
  }
}

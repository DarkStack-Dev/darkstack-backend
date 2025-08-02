// src/domain/usecases/notification/create/create-notification.usecase.ts - MODIFICADO PARA INCLUIR STREAM
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { NotificationGatewayRepository } from '@/domain/repositories/notification/notification.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { Notification } from '@/domain/entities/notification/notification.entity';
import { UserNotFoundUsecaseException } from '../../exceptions/user/user-not-found.usecase.exception';
import { NotificationType } from 'generated/prisma';
import { NotificationStreamService } from '@/infra/services/notification/notification-stream.service';

export type CreateNotificationInput = {
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  relatedId?: string;
  relatedType?: string;
  metadata?: any;
  createdById?: string;
};

export type CreateNotificationOutput = {
  id: string;
  type: NotificationType;
  title: string;
  createdAt: Date;
  streamSent: boolean;
  realTimeSent: boolean; // ✅ NOVO: Indica se a notificação foi enviada em tempo real
};

@Injectable()
export class CreateNotificationUseCase implements UseCase<CreateNotificationInput, CreateNotificationOutput> {
  constructor(
    private readonly notificationRepository: NotificationGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
    private readonly notificationStreamService: NotificationStreamService, // ✅ NOVA DEPENDÊNCIA
  ) {}

  async execute(input: CreateNotificationInput): Promise<CreateNotificationOutput> {
    // Verificar se o usuário que receberá a notificação existe
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new UserNotFoundUsecaseException(
        `User not found with id ${input.userId}`,
        'Usuário destinatário não encontrado',
        CreateNotificationUseCase.name,
      );
    }

    // Verificar se o criador existe (se fornecido)
    if (input.createdById) {
      const creator = await this.userRepository.findById(input.createdById);
      if (!creator) {
        throw new UserNotFoundUsecaseException(
          `Creator not found with id ${input.createdById}`,
          'Usuário criador não encontrado',
          CreateNotificationUseCase.name,
        );
      }
    }

    // Criar notificação
    const notification = Notification.create({
      type: input.type,
      title: input.title,
      message: input.message,
      userId: input.userId,
      relatedId: input.relatedId,
      relatedType: input.relatedType,
      metadata: input.metadata,
      createdById: input.createdById,
    });

    // Persistir
    await this.notificationRepository.create(notification);

    // ✅ NOVO: Enviar notificação em tempo real via SSE
    let streamSent = false;
    try {
      this.notificationStreamService.sendNotificationToUser(input.userId, {
        id: notification.getId(),
        type: notification.getType(),
        title: notification.getTitle(),
        message: notification.getMessage(),
        isRead: notification.getIsRead(),
        relatedId: notification.getRelatedId(),
        relatedType: notification.getRelatedType(),
        metadata: notification.getMetadata(),
        createdAt: notification.getCreatedAt(),
      });
      streamSent = true;
      console.log(`✅ [CreateNotificationUseCase] Real-time notification sent to user ${input.userId}`);
    } catch (error) {
      console.error(`❌ [CreateNotificationUseCase] Failed to send real-time notification:`, error);
    }

    return {
      id: notification.getId(),
      type: notification.getType(),
      title: notification.getTitle(),
      createdAt: notification.getCreatedAt(),
      streamSent,
      realTimeSent: streamSent, // Adiciona o campo obrigatório
    };
  }
}
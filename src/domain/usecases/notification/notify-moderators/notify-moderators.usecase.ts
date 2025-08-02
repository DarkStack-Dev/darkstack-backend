// src/domain/usecases/notification/notify-moderators/notify-moderators.usecase.ts - MODIFICADO PARA INCLUIR STREAM
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { NotificationGatewayRepository } from '@/domain/repositories/notification/notification.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { Notification } from '@/domain/entities/notification/notification.entity';
import { NotificationType } from 'generated/prisma';
import { UserRole } from 'generated/prisma';
import { NotificationStreamService } from '@/infra/services/notification/notification-stream.service';

export type NotifyModeratorsInput = {
  type: NotificationType;
  relatedId: string;
  relatedType: string;
  itemName: string;
};

export type NotifyModeratorsOutput = {
  notifiedCount: number;
  moderatorIds: string[];
  streamsSent: number;
};

@Injectable()
export class NotifyModeratorsUseCase implements UseCase<NotifyModeratorsInput, NotifyModeratorsOutput> {
  constructor(
    private readonly notificationRepository: NotificationGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
    private readonly notificationStreamService: NotificationStreamService, // ✅ NOVA DEPENDÊNCIA
  ) {}

  async execute({ type, relatedId, relatedType, itemName }: NotifyModeratorsInput): Promise<NotifyModeratorsOutput> {
    // Buscar todos os moderadores ativos
    const moderators = await this.userRepository.findByRole(UserRole.MODERATOR);
    const activeModerators = moderators.filter(mod => mod.getIsActivate());

    if (activeModerators.length === 0) {
      return { notifiedCount: 0, moderatorIds: [], streamsSent: 0 };
    }

    let title: string;
    let message: string;
    let url: string;

    // Gerar mensagens baseadas no tipo
    switch (type) {
      case NotificationType.ARTICLE_PENDING:
        title = 'Novo artigo aguardando moderação';
        message = `O artigo "${itemName}" foi enviado e aguarda sua aprovação.`;
        url = `/moderation/articles/${relatedId}`;
        break;
      
      case NotificationType.PROJECT_PENDING:
        title = 'Novo projeto aguardando moderação';
        message = `O projeto "${itemName}" foi enviado e aguarda sua aprovação.`;
        url = `/moderation/projects/${relatedId}`;
        break;
      
      default:
        title = 'Nova moderação necessária';
        message = `Um item aguarda sua moderação.`;
        url = `/moderation`;
    }

    // Criar notificações para todos os moderadores
    const notifications = activeModerators.map(moderator => 
      Notification.create({
        type,
        title,
        message,
        userId: moderator.getId(),
        relatedId,
        relatedType,
        metadata: {
          itemName,
          action: 'moderate',
          url,
        },
      })
    );

    await this.notificationRepository.createMany(notifications);

    // ✅ NOVO: Enviar notificações em tempo real para moderadores conectados
    let streamsSent = 0;
    notifications.forEach(notification => {
      try {
        this.notificationStreamService.sendNotificationToUser(notification.getUserId(), {
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
        streamsSent++;
      } catch (error) {
        console.error(`❌ [NotifyModeratorsUseCase] Failed to send real-time notification to moderator ${notification.getUserId()}:`, error);
      }
    });

    console.log(`✅ [NotifyModeratorsUseCase] Sent ${streamsSent}/${notifications.length} real-time notifications to moderators`);

    return {
      notifiedCount: notifications.length,
      moderatorIds: activeModerators.map(mod => mod.getId()),
      streamsSent,
    };
  }
}
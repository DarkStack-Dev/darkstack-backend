// src/domain/usecases/notification/notify-moderators/notify-moderators.usecase.ts - CORRIGIDO
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { NotificationGatewayRepository } from '@/domain/repositories/notification/notification.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { Notification } from '@/domain/entities/notification/notification.entity';
import { NotificationType } from 'generated/prisma';
import { UserRole } from 'generated/prisma';
import { NotificationGateway } from '@/infra/websocket/notification.gateway'; // ✅ WEBSOCKET GATEWAY

export type NotifyModeratorsInput = {
  type: NotificationType;
  relatedId: string;
  relatedType: string;
  itemName: string;
};

export type NotifyModeratorsOutput = {
  notifiedCount: number;
  moderatorIds: string[];
  realTimeSent: number; // ✅ Quantidade de moderadores que receberam via WebSocket
};

@Injectable()
export class NotifyModeratorsUseCase implements UseCase<NotifyModeratorsInput, NotifyModeratorsOutput> {
  constructor(
    private readonly notificationRepository: NotificationGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
    private readonly notificationGateway: NotificationGateway, // ✅ WEBSOCKET GATEWAY
  ) {}

  async execute({ type, relatedId, relatedType, itemName }: NotifyModeratorsInput): Promise<NotifyModeratorsOutput> {
    // Buscar todos os moderadores ativos
    const moderators = await this.userRepository.findByRole(UserRole.MODERATOR);
    const activeModerators = moderators.filter(mod => mod.getIsActivate());

    if (activeModerators.length === 0) {
      console.log('⚠️ [NotifyModeratorsUseCase] No active moderators found');
      return { notifiedCount: 0, moderatorIds: [], realTimeSent: 0 };
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

    // Persistir notificações no banco
    await this.notificationRepository.createMany(notifications);

    // ✅ ENVIAR NOTIFICAÇÕES EM TEMPO REAL VIA WEBSOCKET
    let realTimeSent = 0;

    // Método 1: Broadcast para room de moderadores (mais eficiente)
    try {
      const moderatorsConnected = this.notificationGateway.sendNotificationToModerators({
        type: 'moderation_request',
        title,
        message,
        relatedId,
        relatedType,
        itemName,
        url,
        notifications: notifications.map(n => ({
          id: n.getId(),
          type: n.getType(),
          title: n.getTitle(),
          message: n.getMessage(),
          userId: n.getUserId(),
          createdAt: n.getCreatedAt(),
        })),
      });

      realTimeSent = moderatorsConnected;
      console.log(`✅ [NotifyModeratorsUseCase] Sent real-time notifications to ${moderatorsConnected} connected moderators`);
    } catch (error) {
      console.error(`❌ [NotifyModeratorsUseCase] Failed to send real-time notifications to moderators:`, error);

      // Método 2: Fallback - enviar individual para cada moderador
      notifications.forEach(notification => {
        try {
          const sent = this.notificationGateway.sendNotificationToUser(notification.getUserId(), {
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
          
          if (sent) realTimeSent++;
        } catch (individualError) {
          console.error(`❌ [NotifyModeratorsUseCase] Failed to send individual notification to moderator ${notification.getUserId()}:`, individualError);
        }
      });
    }

    console.log(`✅ [NotifyModeratorsUseCase] Created ${notifications.length} notifications, ${realTimeSent} sent via WebSocket`);

    return {
      notifiedCount: notifications.length,
      moderatorIds: activeModerators.map(mod => mod.getId()),
      realTimeSent,
    };
  }
}
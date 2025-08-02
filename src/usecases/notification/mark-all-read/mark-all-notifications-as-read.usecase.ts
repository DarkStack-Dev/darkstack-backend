// src/usecases/notification/mark-all-read/mark-all-notifications-as-read.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { NotificationGatewayRepository } from '@/domain/repositories/notification/notification.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { UserNotFoundUsecaseException } from '@/usecases/exceptions/user/user-not-found.usecase.exception';

export type MarkAllNotificationsAsReadInput = {
  userId: string;
};

export type MarkAllNotificationsAsReadOutput = {
  markedCount: number;
  message: string;
};

@Injectable()
export class MarkAllNotificationsAsReadUsecase implements Usecase<MarkAllNotificationsAsReadInput, MarkAllNotificationsAsReadOutput> {
  constructor(
    private readonly notificationRepository: NotificationGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
  ) {}

  async execute({ userId }: MarkAllNotificationsAsReadInput): Promise<MarkAllNotificationsAsReadOutput> {
    // Verificar se usuário existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundUsecaseException(
        `User not found with id ${userId}`,
        'Usuário não encontrado',
        MarkAllNotificationsAsReadUsecase.name,
      );
    }

    // Contar notificações não lidas antes
    const unreadCount = await this.notificationRepository.countUnreadByUserId(userId);

    // Marcar todas como lidas
    await this.notificationRepository.markAllAsReadByUserId(userId);

    return {
      markedCount: unreadCount,
      message: `${unreadCount} notificações marcadas como lidas`,
    };
  }
}
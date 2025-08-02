// src/usecases/notification/get-unread-count/get-unread-notifications-count.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { NotificationGatewayRepository } from '@/domain/repositories/notification/notification.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { UserNotFoundUsecaseException } from '@/usecases/exceptions/user/user-not-found.usecase.exception';

export type GetUnreadNotificationsCountInput = {
  userId: string;
};

export type GetUnreadNotificationsCountOutput = {
  unreadCount: number;
  hasUnread: boolean;
};

@Injectable()
export class GetUnreadNotificationsCountUsecase implements Usecase<GetUnreadNotificationsCountInput, GetUnreadNotificationsCountOutput> {
  constructor(
    private readonly notificationRepository: NotificationGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
  ) {}

  async execute({ userId }: GetUnreadNotificationsCountInput): Promise<GetUnreadNotificationsCountOutput> {
    // Verificar se usuário existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundUsecaseException(
        `User not found with id ${userId}`,
        'Usuário não encontrado',
        GetUnreadNotificationsCountUsecase.name,
      );
    }

    const unreadCount = await this.notificationRepository.countUnreadByUserId(userId);

    return {
      unreadCount,
      hasUnread: unreadCount > 0,
    };
  }
}
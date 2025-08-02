// src/usecases/notification/mark-as-read/mark-notification-as-read.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { MarkNotificationAsReadUseCase as DomainMarkAsReadUseCase } from '@/domain/usecases/notification/mark-as-read/mark-notification-as-read.usecase';

export type MarkNotificationAsReadInput = {
  notificationId: string;
  userId: string;
};

export type MarkNotificationAsReadOutput = {
  id: string;
  isRead: boolean;
  readAt: Date;
  message: string;
};

@Injectable()
export class MarkNotificationAsReadUsecase implements Usecase<MarkNotificationAsReadInput, MarkNotificationAsReadOutput> {
  constructor(
    private readonly domainMarkAsReadUseCase: DomainMarkAsReadUseCase,
  ) {}

  async execute(input: MarkNotificationAsReadInput): Promise<MarkNotificationAsReadOutput> {
    const result = await this.domainMarkAsReadUseCase.execute(input);
    
    return {
      ...result,
      message: 'Notificação marcada como lida',
    };
  }
}
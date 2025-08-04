// src/usecases/notification/find-by-user/find-notifications-by-user.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { FindNotificationsByUserUseCase as DomainFindUseCase } from '@/domain/usecases/notification/find-by-user/find-notifications-by-user.usecase';

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
export class FindNotificationsByUserUsecase implements Usecase<FindNotificationsByUserInput, FindNotificationsByUserOutput> {
  constructor(
    private readonly domainFindUseCase: DomainFindUseCase,
  ) {}

  async execute(input: FindNotificationsByUserInput): Promise<FindNotificationsByUserOutput> {
    return this.domainFindUseCase.execute(input);
  }
}
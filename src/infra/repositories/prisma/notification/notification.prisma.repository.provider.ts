// src/infra/repositories/prisma/notification/notification.prisma.repository.provider.ts
import { NotificationGatewayRepository } from '@/domain/repositories/notification/notification.gateway.repository';
import { NotificationPrismaRepository } from './notification.prisma.repository';

export const notificationPrismaRepositoryProvider = {
  provide: NotificationGatewayRepository,
  useClass: NotificationPrismaRepository,
};
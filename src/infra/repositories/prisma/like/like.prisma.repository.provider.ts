// src/infra/repositories/prisma/like/like.prisma.repository.provider.ts
import { LikeGatewayRepository } from '@/domain/repositories/like/like.gateway.repository';
import { LikePrismaRepository } from './like.prisma.repository';

export const likePrismaRepositoryProvider = {
  provide: LikeGatewayRepository,
  useClass: LikePrismaRepository,
};
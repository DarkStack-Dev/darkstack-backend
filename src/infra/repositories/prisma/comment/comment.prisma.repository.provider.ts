// src/infra/repositories/prisma/comment/comment.prisma.repository.provider.ts
import { CommentGatewayRepository } from '@/domain/repositories/comment/comment.gateway.repository';
import { CommentPrismaRepository } from './comment.prisma.repository';

export const commentPrismaRepositoryProvider = {
  provide: CommentGatewayRepository,
  useClass: CommentPrismaRepository,
};
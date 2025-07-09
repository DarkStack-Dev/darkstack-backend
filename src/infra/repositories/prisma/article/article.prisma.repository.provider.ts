// src/infra/repositories/prisma/article/article.prisma.repository.provider.ts
import { ArticleGatewayRepository } from '@/domain/repositories/article/article.gateway.repository';
import { ArticlePrismaRepository } from './article.prisma.repository';

export const articlePrismaRepositoryProvider = {
  provide: ArticleGatewayRepository,
  useClass: ArticlePrismaRepository,
};
// src/usecases/article/stats/article-stats.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { ArticleStatsUseCase as DomainArticleStatsUseCase } from '@/domain/usecases/article/stats/article-stats.usecase';
import { UserNotFoundUsecaseException } from '@/usecases/exceptions/user/user-not-found.usecase.exception';
import { InvalidInputUsecaseException } from '@/usecases/exceptions/input/invalid-input.usecase.exception';
import { UserRole } from 'generated/prisma';

export type ArticleStatsInput = {
  adminId: string;
  adminRoles: UserRole[];
};

export type ArticleStatsOutput = {
  totalArticles: number;
  pendingArticles: number;
  approvedArticles: number;
  rejectedArticles: number;
  archivedArticles: number;
  totalViews: number;
  averageReadingTime: number;
  articlesByCategory: Record<string, number>;
  topTags: Array<{ tag: string; count: number }>;
  mostViewedArticles: Array<{
    id: string;
    titulo: string;
    slug: string;
    visualizacoes: number;
    author: string;
  }>;
  recentlyPublished: Array<{
    id: string;
    titulo: string;
    slug: string;
    approvedAt: Date;
    author: string;
  }>;
  admin: {
    id: string;
    name: string;
    email: string;
  };
  generatedAt: Date;
};

@Injectable()
export class ArticleStatsUsecase implements Usecase<ArticleStatsInput, ArticleStatsOutput> {
  constructor(
    private readonly domainArticleStatsUseCase: DomainArticleStatsUseCase,
  ) {}

  async execute(input: ArticleStatsInput): Promise<ArticleStatsOutput> {
    try {
      return await this.domainArticleStatsUseCase.execute(input);
    } catch (error) {
      // Mapear exceptions do domínio para aplicação
      if (error.name === 'UserNotFoundUsecaseException') {
        throw new UserNotFoundUsecaseException(
          error.internalMessage || `Admin not found in ${ArticleStatsUsecase.name}`,
          error.externalMessage || 'Administrador não encontrado',
          ArticleStatsUsecase.name,
        );
      }

      if (error.name === 'InvalidInputUsecaseException') {
        throw new InvalidInputUsecaseException(
          error.internalMessage || `Invalid input in ${ArticleStatsUsecase.name}`,
          error.externalMessage || 'Dados inválidos',
          ArticleStatsUsecase.name,
        );
      }

      throw error;
    }
  }
}
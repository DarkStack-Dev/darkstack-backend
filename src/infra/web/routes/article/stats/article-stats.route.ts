// src/infra/web/routes/article/stats/article-stats.route.ts
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { ArticleStatsUsecase } from '@/usecases/article/stats/article-stats.usecase';
import { Roles } from '@/infra/web/auth/decorators/roles.decorator';

export type ArticleStatsResponse = {
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

@Controller('/articlesa')
export class ArticleStatsRoute {
  constructor(
    private readonly articleStatsUsecase: ArticleStatsUsecase, // ✅ Usando caso de uso
  ) {}

  @Get('/stats')
  @Roles('ADMIN') // Apenas administradores
  public async handle(@Req() req: Request): Promise<ArticleStatsResponse> {
    const adminId = req['userId'];
    const adminRoles = req['user']?.roles || [];

    console.log(`📊 API: Admin ${adminId} solicitando estatísticas de artigos`);

    const output = await this.articleStatsUsecase.execute({
      adminId,
      adminRoles,
    });

    console.log(`✅ API: Estatísticas geradas - ${output.totalArticles} artigos total`);

    return output;
  }
}
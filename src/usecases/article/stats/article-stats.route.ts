// 1. Route adicional para estatísticas (apenas admins)
// src/infra/web/routes/article/stats/article-stats.route.ts
import { Controller, Get } from '@nestjs/common';
import { ArticleGatewayRepository } from '@/domain/repositories/article/article.gateway.repository';
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
};

@Controller('/articles')
export class ArticleStatsRoute {
  constructor(
    private readonly articleRepository: ArticleGatewayRepository,
  ) {}

  @Get('/stats')
  @Roles('ADMIN')
  public async handle(): Promise<ArticleStatsResponse> {
    console.log('📊 Gerando estatísticas de artigos');

    const [stats, mostViewed, recentlyPublished] = await Promise.all([
      this.articleRepository.getStats(),
      this.articleRepository.getMostViewed(5),
      this.articleRepository.getRecentlyPublished(5),
    ]);

    return {
      totalArticles: stats.totalArticles,
      pendingArticles: stats.pendingArticles,
      approvedArticles: stats.approvedArticles,
      rejectedArticles: stats.rejectedArticles,
      archivedArticles: stats.archivedArticles,
      totalViews: stats.totalViews,
      averageReadingTime: stats.averageReadingTime,
      articlesByCategory: stats.articlesByCategory,
      topTags: stats.topTags,
      mostViewedArticles: mostViewed.map(article => ({
        id: article.getId(),
        titulo: article.getTitulo(),
        slug: article.getSlug(),
        visualizacoes: article.getVisualizacoes(),
        author: 'Nome do autor', // Buscar do repository se necessário
      })),
      recentlyPublished: recentlyPublished.map(article => ({
        id: article.getId(),
        titulo: article.getTitulo(),
        slug: article.getSlug(),
        approvedAt: article.getApprovedAt()!,
        author: 'Nome do autor', // Buscar do repository se necessário
      })),
    };
  }
}

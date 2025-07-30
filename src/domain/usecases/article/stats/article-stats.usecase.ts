// src/domain/usecases/article/stats/article-stats.usecase.ts
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { ArticleGatewayRepository } from '@/domain/repositories/article/article.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { UserNotFoundUsecaseException } from '../../exceptions/user/user-not-found.usecase.exception';
import { InvalidInputUsecaseException } from '../../exceptions/input/invalid-input.usecase.exception';
import { UserRole, ArticleCategory } from 'generated/prisma';

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
export class ArticleStatsUseCase implements UseCase<ArticleStatsInput, ArticleStatsOutput> {
  constructor(
    private readonly articleRepository: ArticleGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
  ) {}

  async execute({ adminId, adminRoles }: ArticleStatsInput): Promise<ArticleStatsOutput> {
    // Verificar permissões (apenas ADMIN)
    this.checkAdminPermissions(adminRoles);

    // Verificar se admin existe
    const admin = await this.userRepository.findById(adminId);
    if (!admin) {
      throw new UserNotFoundUsecaseException(
        `Admin not found with id ${adminId}`,
        'Administrador não encontrado',
        ArticleStatsUseCase.name,
      );
    }

    console.log(`📊 Admin ${admin.getName()} gerando estatísticas de artigos`);

    // Buscar todas as estatísticas em paralelo
    const [stats, mostViewed, recentlyPublished] = await Promise.all([
      this.articleRepository.getStats(),
      this.articleRepository.getMostViewed(5),
      this.articleRepository.getRecentlyPublished(5),
    ]);

    // Buscar nomes dos autores para artigos mais visualizados
    const mostViewedWithAuthors = await Promise.all(
      mostViewed.map(async (article) => {
        const author = await this.userRepository.findById(article.getAuthorId());
        return {
          id: article.getId(),
          titulo: article.getTitulo(),
          slug: article.getSlug(),
          visualizacoes: article.getVisualizacoes(),
          author: author ? author.getName() : 'Autor não encontrado',
        };
      })
    );

    // Buscar nomes dos autores para artigos recentemente publicados
    const recentlyPublishedWithAuthors = await Promise.all(
      recentlyPublished.map(async (article) => {
        const author = await this.userRepository.findById(article.getAuthorId());
        return {
          id: article.getId(),
          titulo: article.getTitulo(),
          slug: article.getSlug(),
          approvedAt: article.getApprovedAt()!,
          author: author ? author.getName() : 'Autor não encontrado',
        };
      })
    );

    const generatedAt = new Date();

    console.log(`✅ Estatísticas geradas: ${stats.totalArticles} artigos total`);

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
      mostViewedArticles: mostViewedWithAuthors,
      recentlyPublished: recentlyPublishedWithAuthors,
      admin: {
        id: admin.getId(),
        name: admin.getName(),
        email: admin.getEmail(),
      },
      generatedAt,
    };
  }

  private checkAdminPermissions(roles: UserRole[]): void {
    const isAdmin = roles.includes(UserRole.ADMIN);

    if (!isAdmin) {
      throw new InvalidInputUsecaseException(
        'User attempted to access article stats without ADMIN role',
        'Apenas administradores podem acessar estatísticas de artigos',
        ArticleStatsUseCase.name,
      );
    }
  }
}
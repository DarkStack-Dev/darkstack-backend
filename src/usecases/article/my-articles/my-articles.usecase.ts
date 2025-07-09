// src/usecases/article/my-articles/my-articles.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { ArticleGatewayRepository } from '@/domain/repositories/article/article.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { UserNotFoundUsecaseException } from '@/usecases/exceptions/user/user-not-found.usecase.exception';
import { ArticleStatus } from 'generated/prisma';

export type MyArticlesInput = {
  userId: string;
  page?: number;
  limit?: number;
  status?: ArticleStatus;
};

export type MyArticlesOutput = {
  articles: Array<{
    id: string;
    titulo: string;
    slug: string;
    descricao: string;
    categoria: string;
    tags: string[];
    status: ArticleStatus;
    visualizacoes: number;
    tempoLeituraMinutos?: number;
    createdAt: Date;
    updatedAt: Date;
    rejectionReason?: string;
    canEdit: boolean;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    archived: number;
    canCreateMore: boolean;
    articlesLeft: number;
  };
};

@Injectable()
export class MyArticlesUsecase implements Usecase<MyArticlesInput, MyArticlesOutput> {
  constructor(
    private readonly articleRepository: ArticleGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
  ) {}

  async execute({ userId, page = 1, limit = 10, status }: MyArticlesInput): Promise<MyArticlesOutput> {
    // Verificar se usuário existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundUsecaseException(
        `User not found with id ${userId}`,
        'Usuário não encontrado',
        MyArticlesUsecase.name,
      );
    }

    // Buscar artigos do usuário
    const result = await this.articleRepository.findAll({
      authorId: userId,
      status,
      limit,
      offset: (page - 1) * limit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      includeContent: false,
    });

    // Calcular estatísticas
    const [
      totalArticles,
      pendingArticles,
      approvedArticles,
      rejectedArticles,
      archivedArticles,
      canCreateMore,
    ] = await Promise.all([
      this.articleRepository.countByAuthor(userId),
      this.articleRepository.count({ authorId: userId, status: ArticleStatus.PENDING }),
      this.articleRepository.count({ authorId: userId, status: ArticleStatus.APPROVED }),
      this.articleRepository.count({ authorId: userId, status: ArticleStatus.REJECTED }),
      this.articleRepository.count({ authorId: userId, status: ArticleStatus.ARCHIVED }),
      this.articleRepository.canUserCreateArticle(userId),
    ]);

    const articlesLeft = Math.max(0, 5 - totalArticles);

    const articles = result.articles.map(article => ({
      id: article.getId(),
      titulo: article.getTitulo(),
      slug: article.getSlug(),
      descricao: article.getDescricao(),
      categoria: article.getCategoria(),
      tags: article.getTags(),
      status: article.getStatus(),
      visualizacoes: article.getVisualizacoes(),
      tempoLeituraMinutos: article.getTempoLeituraMinutos(),
      createdAt: article.getCreatedAt(),
      updatedAt: article.getUpdatedAt(),
      rejectionReason: article.getRejectionReason(),
      canEdit: article.canBeEditedBy(userId),
    }));

    return {
      articles,
      pagination: {
        page: result.page,
        limit: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrevious: result.hasPrevious,
      },
      stats: {
        total: totalArticles,
        pending: pendingArticles,
        approved: approvedArticles,
        rejected: rejectedArticles,
        archived: archivedArticles,
        canCreateMore,
        articlesLeft,
      },
    };
  }
}
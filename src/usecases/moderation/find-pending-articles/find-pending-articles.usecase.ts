// src/usecases/moderation/find-pending-articles/find-pending-articles.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { ArticleGatewayRepository } from '@/domain/repositories/article/article.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { UserNotFoundUsecaseException } from '@/usecases/exceptions/user/user-not-found.usecase.exception';

export type FindPendingArticlesInput = {
  moderatorId: string;
  limit: number;
  offset: number;
};

export type PendingArticleItem = {
  id: string;
  titulo: string;
  slug: string;
  descricao: string;
  categoria: string;
  tags: string[];
  authorName: string;
  authorId: string;
  createdAt: Date;
  status: string;
  tempoLeituraMinutos?: number;
};

export type FindPendingArticlesOutput = {
  articles: PendingArticleItem[];
  total: number;
  page: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

@Injectable()
export class FindPendingArticlesUsecase implements Usecase<FindPendingArticlesInput, FindPendingArticlesOutput> {
  constructor(
    private readonly articleRepository: ArticleGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
  ) {}

  async execute({ moderatorId, limit, offset }: FindPendingArticlesInput): Promise<FindPendingArticlesOutput> {
    // Verificar se moderador existe
    const moderator = await this.userRepository.findById(moderatorId);
    if (!moderator) {
      throw new UserNotFoundUsecaseException(
        `Moderator not found with id ${moderatorId}`,
        'Moderador não encontrado',
        FindPendingArticlesUsecase.name,
      );
    }

    // Buscar artigos pendentes
    const pendingArticles = await this.articleRepository.findForModeration(moderatorId);

    // Buscar informações dos autores
    const articlesWithAuthors = await Promise.all(
      pendingArticles.map(async (article) => {
        const author = await this.userRepository.findById(article.getAuthorId());
        return {
          id: article.getId(),
          titulo: article.getTitulo(),
          slug: article.getSlug(),
          descricao: article.getDescricao(),
          categoria: article.getCategoria(),
          tags: article.getTags(),
          authorName: author ? author.getName() : 'Autor não encontrado',
          authorId: article.getAuthorId(),
          createdAt: article.getCreatedAt(),
          status: article.getStatus(),
          tempoLeituraMinutos: article.getTempoLeituraMinutos(),
        };
      })
    );

    // Aplicar paginação
    const paginatedArticles = articlesWithAuthors.slice(offset, offset + limit);
    const total = articlesWithAuthors.length;
    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return {
      articles: paginatedArticles,
      total,
      page,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }
}
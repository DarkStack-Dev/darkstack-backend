// src/domain/usecases/article/list/list-articles.usecase.ts
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { ArticleGatewayRepository, ArticleSearchFilters } from '@/domain/repositories/article/article.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { ArticleStatus, ArticleCategory } from 'generated/prisma';

export type ListArticlesInput = {
  page?: number;
  limit?: number;
  search?: string;
  categoria?: ArticleCategory;
  tags?: string[];
  authorId?: string;
  status?: ArticleStatus;
  sortBy?: 'createdAt' | 'updatedAt' | 'titulo' | 'visualizacoes';
  sortOrder?: 'asc' | 'desc';
  currentUserId?: string;
  includeContent?: boolean;
};

export type ArticleSummary = {
  id: string;
  titulo: string;
  slug: string;
  descricao: string;
  conteudo?: string;
  categoria: ArticleCategory;
  tags: string[];
  status: ArticleStatus;
  visualizacoes: number;
  tempoLeituraMinutos?: number;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  mainImage?: {
    url: string;
    alt?: string;
  };
  isOwner: boolean;
};

export type ListArticlesOutput = {
  articles: ArticleSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
};

@Injectable()
export class ListArticlesUseCase implements UseCase<ListArticlesInput, ListArticlesOutput> {
  constructor(
    private readonly articleRepository: ArticleGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
  ) {}

  async execute({
    page = 1,
    limit = 20,
    search,
    categoria,
    tags,
    authorId,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    currentUserId,
    includeContent = false,
  }: ListArticlesInput): Promise<ListArticlesOutput> {
    
    const filters: ArticleSearchFilters = {
      search,
      categoria,
      tags,
      authorId,
      status: status || ArticleStatus.APPROVED, // Por padrão, mostrar apenas aprovados
      isActive: true,
      limit: Math.min(limit, 100), // Máximo 100 por página
      offset: (page - 1) * Math.min(limit, 100),
      sortBy,
      sortOrder,
      includeContent,
    };

    const result = await this.articleRepository.findAll(filters);

    // Buscar dados dos autores
    const authorIds = [...new Set(result.articles.map(article => article.getAuthorId()))];
    const authorsMap = new Map();
    
    for (const authorId of authorIds) {
      const author = await this.userRepository.findById(authorId);
      if (author) {
        authorsMap.set(authorId, {
          id: author.getId(),
          name: author.getName(),
          avatar: author.getAvatar(),
        });
      }
    }

    const articles: ArticleSummary[] = result.articles.map(article => {
      const author = authorsMap.get(article.getAuthorId()) || {
        id: article.getAuthorId(),
        name: 'Autor não encontrado',
        avatar: undefined,
      };

      const mainImage = article.getImages().find(img => img.isMain);

      return {
        id: article.getId(),
        titulo: article.getTitulo(),
        slug: article.getSlug(),
        descricao: article.getDescricao(),
        ...(includeContent && { conteudo: article.getConteudo() }),
        categoria: article.getCategoria(),
        tags: article.getTags(),
        status: article.getStatus(),
        visualizacoes: article.getVisualizacoes(),
        tempoLeituraMinutos: article.getTempoLeituraMinutos(),
        createdAt: article.getCreatedAt(),
        updatedAt: article.getUpdatedAt(),
        author,
        ...(mainImage && {
          mainImage: {
            url: mainImage.url || '',
            alt: mainImage.alt,
          },
        }),
        isOwner: currentUserId === article.getAuthorId(),
      };
    });

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
    };
  }
}
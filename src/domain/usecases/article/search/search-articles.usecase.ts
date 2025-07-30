// src/domain/usecases/article/search/search-articles.usecase.ts
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { ArticleGatewayRepository, ArticleSearchFilters } from '@/domain/repositories/article/article.gateway.repository';
import { InvalidInputUsecaseException } from '../../exceptions/input/invalid-input.usecase.exception';
import { ArticleCategory } from 'generated/prisma';

export type SearchArticlesInput = {
  query: string;
  categoria?: ArticleCategory;
  tags?: string[];
  page?: number;
  limit?: number;
};

export type SearchArticlesOutput = {
  query: string;
  results: Array<{
    id: string;
    titulo: string;
    slug: string;
    descricao: string;
    categoria: ArticleCategory;
    tags: string[];
    visualizacoes: number;
    createdAt: Date;
    relevanceScore?: number;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  suggestions?: string[];
};

@Injectable()
export class SearchArticlesUseCase implements UseCase<SearchArticlesInput, SearchArticlesOutput> {
  constructor(
    private readonly articleRepository: ArticleGatewayRepository,
  ) {}

  async execute({ query, categoria, tags, page = 1, limit = 20 }: SearchArticlesInput): Promise<SearchArticlesOutput> {
    // Validar entrada
    if (!query || query.trim().length < 2) {
      return {
        query: query || '',
        results: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    }

    const cleanQuery = query.trim();
    const finalLimit = Math.min(limit, 50); // Máximo 50 resultados por vez

    console.log(`🔍 Buscando artigos: "${cleanQuery}"`);

    const searchFilters: Partial<ArticleSearchFilters> = {
      categoria,
      tags,
      limit: finalLimit,
      offset: (page - 1) * finalLimit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    const result = await this.articleRepository.searchByContent(cleanQuery, searchFilters);

    // Mapear resultados
    const results = result.articles.map(article => ({
      id: article.getId(),
      titulo: article.getTitulo(),
      slug: article.getSlug(),
      descricao: article.getDescricao(),
      categoria: article.getCategoria(),
      tags: article.getTags(),
      visualizacoes: article.getVisualizacoes(),
      createdAt: article.getCreatedAt(),
      // TODO: Implementar cálculo de relevância no futuro
      relevanceScore: undefined,
    }));

    console.log(`✅ Encontrados ${results.length} artigos para "${cleanQuery}"`);

    return {
      query: cleanQuery,
      results,
      pagination: {
        page: result.page,
        limit: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
      // TODO: Implementar sugestões de busca no futuro
      suggestions: undefined,
    };
  }
}
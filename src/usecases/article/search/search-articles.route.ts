// 2. Route para busca avançada
// src/infra/web/routes/article/search/search-articles.route.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ArticleGatewayRepository } from '@/domain/repositories/article/article.gateway.repository';
import { IsPublic } from '@/infra/web/auth/decorators/is-public.decorator';
import { ArticleCategory } from 'generated/prisma';

export type SearchArticlesQuery = {
  q: string; // Query de busca
  categoria?: ArticleCategory;
  tags?: string;
  page?: string;
  limit?: string;
};

export type SearchArticlesResponse = {
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
    relevanceScore?: number; // Para futuras implementações de relevância
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  suggestions?: string[]; // Sugestões de busca alternativa
};

@Controller('/articles')
export class SearchArticlesRoute {
  constructor(
    private readonly articleRepository: ArticleGatewayRepository,
  ) {}

  @Get('/search')
  @IsPublic()
  public async handle(@Query() query: SearchArticlesQuery): Promise<SearchArticlesResponse> {
    const { q, categoria, tags, page = '1', limit = '20' } = query;

    if (!q || q.trim().length < 2) {
      return {
        query: q || '',
        results: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    }

    console.log(`🔍 Buscando artigos: "${q}"`);

    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : undefined;

    const result = await this.articleRepository.searchByContent(q, {
      categoria,
      tags: tagsArray,
      limit: Math.min(parseInt(limit), 50), // Máximo 50 resultados por vez
      offset: (parseInt(page) - 1) * Math.min(parseInt(limit), 50),
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    return {
      query: q,
      results: result.articles.map(article => ({
        id: article.getId(),
        titulo: article.getTitulo(),
        slug: article.getSlug(),
        descricao: article.getDescricao(),
        categoria: article.getCategoria(),
        tags: article.getTags(),
        visualizacoes: article.getVisualizacoes(),
        createdAt: article.getCreatedAt(),
      })),
      pagination: {
        page: result.page,
        limit: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
      },
    };
  }
}
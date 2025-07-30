// src/infra/web/routes/article/search/search-articles.route.ts
import { Controller, Get, Query } from '@nestjs/common';
import { SearchArticlesUsecase } from '@/usecases/article/search/search-articles.usecase';
import { IsPublic } from '@/infra/web/auth/decorators/is-public.decorator';
import { ArticleCategory } from 'generated/prisma';

export type SearchArticlesQuery = {
  q: string; // Query de busca
  categoria?: ArticleCategory;
  tags?: string; // Comma-separated
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

@Controller('/articles')
export class SearchArticlesRoute {
  constructor(
    private readonly searchArticlesUsecase: SearchArticlesUsecase, // ✅ Usando caso de uso
  ) {}

  @Get('/search')
  @IsPublic()
  public async handle(@Query() query: SearchArticlesQuery): Promise<SearchArticlesResponse> {
    const { q, categoria, tags, page = '1', limit = '20' } = query;

    console.log(`🔍 API: Buscando artigos - query: "${q}"`);

    // Processar tags da query (comma-separated)
    let tagsArray: string[] | undefined;
    if (tags) {
      tagsArray = tags.split(',').map(tag => tag.trim());
    }

    const output = await this.searchArticlesUsecase.execute({
      query: q,
      categoria,
      tags: tagsArray,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    console.log(`✅ API: Encontrados ${output.results.length} resultados para "${q}"`);

    return output;
  }
}
// src/usecases/article/search/search-articles.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { SearchArticlesUseCase as DomainSearchArticlesUseCase } from '@/domain/usecases/article/search/search-articles.usecase';
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
export class SearchArticlesUsecase implements Usecase<SearchArticlesInput, SearchArticlesOutput> {
  constructor(
    private readonly domainSearchArticlesUseCase: DomainSearchArticlesUseCase,
  ) {}

  async execute(input: SearchArticlesInput): Promise<SearchArticlesOutput> {
    return await this.domainSearchArticlesUseCase.execute(input);
  }
}
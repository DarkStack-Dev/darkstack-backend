// src/usecases/article/list/list-articles.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { ListArticlesUseCase as DomainListArticlesUseCase } from '@/domain/usecases/article/list/list-articles.usecase';
import { ArticleCategory, ArticleStatus } from 'generated/prisma';

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
export class ListArticlesUsecase implements Usecase<ListArticlesInput, ListArticlesOutput> {
  constructor(
    private readonly domainListArticlesUseCase: DomainListArticlesUseCase,
  ) {}

  async execute(input: ListArticlesInput): Promise<ListArticlesOutput> {
    return await this.domainListArticlesUseCase.execute(input);
  }
}
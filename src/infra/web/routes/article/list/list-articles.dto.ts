// src/infra/web/routes/article/list/list-articles.dto.ts
import { ArticleCategory, ArticleStatus } from "generated/prisma";

export type ListArticlesQuery = {
  page?: string;
  limit?: string;
  search?: string;
  categoria?: ArticleCategory;
  tags?: string; // Comma-separated
  authorId?: string;
  status?: ArticleStatus;
  sortBy?: 'createdAt' | 'updatedAt' | 'titulo' | 'visualizacoes';
  sortOrder?: 'asc' | 'desc';
  includeContent?: string;
};

export type ListArticlesResponse = {
  articles: Array<{
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
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
};
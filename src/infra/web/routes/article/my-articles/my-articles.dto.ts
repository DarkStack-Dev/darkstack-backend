// src/infra/web/routes/article/my-articles/my-articles.dto.ts
import { ArticleStatus } from "generated/prisma";

export type MyArticlesQuery = {
  page?: string;
  limit?: string;
  status?: ArticleStatus;
};

export type MyArticlesResponse = {
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
// src/domain/repositories/article/article.gateway.repository.ts
import { Article } from "@/domain/entities/article/article.entity";
import { ArticleStatus, ArticleCategory } from "generated/prisma";

export type ArticleSearchFilters = {
  search?: string; // Busca por título, descrição ou conteúdo
  authorId?: string;
  categoria?: ArticleCategory;
  tags?: string[];
  status?: ArticleStatus;
  isActive?: boolean;
  approvedById?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'titulo' | 'visualizacoes' | 'tempoLeituraMinutos';
  sortOrder?: 'asc' | 'desc';
  includeContent?: boolean; // Para otimizar queries que não precisam do conteúdo completo
};

export type PaginatedArticleResult = {
  articles: Article[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type ArticleStatsResult = {
  totalArticles: number;
  pendingArticles: number;
  approvedArticles: number;
  rejectedArticles: number;
  archivedArticles: number;
  totalViews: number;
  averageReadingTime: number;
  articlesByCategory: Record<ArticleCategory, number>;
  topTags: Array<{ tag: string; count: number }>;
};

export abstract class ArticleGatewayRepository {
  // CRUD básico
  abstract findById(id: string, includeContent?: boolean): Promise<Article | null>;
  abstract findBySlug(slug: string, includeContent?: boolean): Promise<Article | null>;
  abstract findByIdIncludingDeleted(id: string): Promise<Article | null>;
  abstract findAll(filters?: ArticleSearchFilters): Promise<PaginatedArticleResult>;
  abstract create(article: Article): Promise<void>;
  abstract update(article: Article): Promise<void>;
  abstract softDelete(id: string): Promise<void>;
  abstract hardDelete(id: string): Promise<void>;
  abstract restore(id: string): Promise<void>;

  // Métodos específicos para artigos
  abstract findByAuthorId(authorId: string, includeContent?: boolean): Promise<Article[]>;
  abstract findByCategory(categoria: ArticleCategory, filters?: Partial<ArticleSearchFilters>): Promise<Article[]>;
  abstract findByTag(tag: string, filters?: Partial<ArticleSearchFilters>): Promise<Article[]>;
  abstract findByStatus(status: ArticleStatus, filters?: Partial<ArticleSearchFilters>): Promise<Article[]>;
  abstract findPublished(filters?: Partial<ArticleSearchFilters>): Promise<PaginatedArticleResult>;
  abstract findPending(filters?: Partial<ArticleSearchFilters>): Promise<Article[]>;
  abstract findRejected(filters?: Partial<ArticleSearchFilters>): Promise<Article[]>;
  
  // Métodos para moderação
  abstract findForModeration(moderatorId?: string): Promise<Article[]>;
  abstract findModeratedBy(moderatorId: string): Promise<Article[]>;
  
  // Métodos para estatísticas
  abstract count(filters?: Partial<ArticleSearchFilters>): Promise<number>;
  abstract countByAuthor(authorId: string): Promise<number>;
  abstract countByStatus(status: ArticleStatus): Promise<number>;
  abstract getStats(): Promise<ArticleStatsResult>;
  abstract getMostViewed(limit?: number): Promise<Article[]>;
  abstract getRecentlyPublished(limit?: number): Promise<Article[]>;
  abstract getSimilarArticles(articleId: string, limit?: number): Promise<Article[]>;
  
  // Métodos para tags
  abstract getAllTags(): Promise<string[]>;
  abstract getPopularTags(limit?: number): Promise<Array<{ tag: string; count: number }>>;
  
  // Métodos de validação
  abstract isSlugUnique(slug: string, excludeId?: string): Promise<boolean>;
  abstract canUserCreateArticle(userId: string): Promise<boolean>; // Verificar limite de 5 artigos
  
  // Métodos para SEO e performance
  abstract incrementViews(id: string): Promise<void>;
  abstract updateReadingTime(id: string, minutes: number): Promise<void>;
  abstract findSoftDeleted(): Promise<Article[]>;
  
  // Busca avançada
  abstract searchByContent(query: string, filters?: Partial<ArticleSearchFilters>): Promise<PaginatedArticleResult>;
  abstract findRelatedByTags(articleId: string, limit?: number): Promise<Article[]>;
}
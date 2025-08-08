// src/domain/repositories/comment/comment.gateway.repository.ts
import { Comment, CommentTarget } from '@/domain/entities/comment/comment.entity';

export type CommentSearchFilters = {
  targetId?: string;
  targetType?: CommentTarget;
  authorId?: string;
  parentId?: string | null; // null para buscar apenas comentários raiz
  approved?: boolean;
  isDeleted?: boolean;
  search?: string; // Busca no conteúdo
  limit?: number;
  offset?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'repliesCount';
  orderDirection?: 'asc' | 'desc';
};

export type CommentWithAuthor = {
  comment: Comment;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  repliesPreview?: CommentWithAuthor[]; // Primeiras respostas para exibição
};

export type PaginatedCommentResult = {
  comments: CommentWithAuthor[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type CommentThreadResult = {
  rootComment: CommentWithAuthor;
  replies: CommentWithAuthor[];
  totalReplies: number;
  hasMoreReplies: boolean;
};

export type CommentStatistics = {
  totalComments: number;
  totalApproved: number;
  totalPending: number;
  totalRejected: number;
  totalDeleted: number;
  commentsToday: number;
  commentsThisWeek: number;
  commentsThisMonth: number;
  topAuthors: Array<{
    authorId: string;
    authorName: string;
    count: number;
  }>;
};

export abstract class CommentGatewayRepository {
  // 🔍 CRUD Básico
  abstract findById(id: string): Promise<Comment | null>;
  abstract findByIdWithAuthor(id: string): Promise<CommentWithAuthor | null>;
  abstract create(comment: Comment): Promise<void>;
  abstract update(comment: Comment): Promise<void>;
  abstract softDelete(id: string): Promise<void>;
  abstract hardDelete(id: string): Promise<void>;

  // 📋 Listagem e Busca
  abstract findAll(filters?: CommentSearchFilters): Promise<PaginatedCommentResult>;
  abstract findByTargetId(
    targetId: string,
    targetType: CommentTarget,
    filters?: Omit<CommentSearchFilters, 'targetId' | 'targetType'>
  ): Promise<PaginatedCommentResult>;
  abstract findByAuthorId(
    authorId: string,
    filters?: Omit<CommentSearchFilters, 'authorId'>
  ): Promise<PaginatedCommentResult>;

  // 🧵 Sistema de Threads
  abstract findRootComments(
    targetId: string,
    targetType: CommentTarget,
    filters?: { limit?: number; offset?: number; orderBy?: 'createdAt' | 'repliesCount'; orderDirection?: 'asc' | 'desc' }
  ): Promise<PaginatedCommentResult>;
  
  abstract findReplies(
    parentId: string,
    filters?: { limit?: number; offset?: number; orderBy?: 'createdAt'; orderDirection?: 'asc' | 'desc' }
  ): Promise<PaginatedCommentResult>;
  
  abstract findThread(
    rootCommentId: string,
    repliesLimit?: number,
    repliesOffset?: number
  ): Promise<CommentThreadResult>;

  // 📊 Contadores e Estatísticas
  abstract count(filters?: Partial<CommentSearchFilters>): Promise<number>;
  abstract countByTarget(targetId: string, targetType: CommentTarget, approved?: boolean): Promise<number>;
  abstract countReplies(parentId: string, approved?: boolean): Promise<number>;
  abstract getStatistics(targetId?: string, targetType?: CommentTarget): Promise<CommentStatistics>;

  // ✅ Moderação
  abstract findPendingModeration(
    filters?: { limit?: number; offset?: number; targetType?: CommentTarget }
  ): Promise<PaginatedCommentResult>;
  abstract approve(commentId: string, moderatorId: string): Promise<void>;
  abstract reject(commentId: string, moderatorId: string, reason: string): Promise<void>;
  abstract bulkApprove(commentIds: string[], moderatorId: string): Promise<void>;
  abstract bulkReject(commentIds: string[], moderatorId: string, reason: string): Promise<void>;

  // 🔄 Atualizações de Contador
  abstract incrementRepliesCount(parentId: string): Promise<void>;
  abstract decrementRepliesCount(parentId: string): Promise<void>;
  abstract updateTargetCommentsCount(targetId: string, targetType: CommentTarget): Promise<void>;

  // 🔍 Verificações
  abstract exists(id: string): Promise<boolean>;
  abstract existsByTargetAndAuthor(targetId: string, targetType: CommentTarget, authorId: string): Promise<boolean>;
  abstract canUserComment(userId: string, targetId: string, targetType: CommentTarget): Promise<boolean>;

  // 📈 Analytics
  abstract getCommentsByDateRange(
    startDate: Date,
    endDate: Date,
    targetId?: string,
    targetType?: CommentTarget
  ): Promise<Array<{ date: string; count: number }>>;
  
  abstract getMostActiveAuthors(
    limit: number,
    targetId?: string,
    targetType?: CommentTarget
  ): Promise<Array<{ authorId: string; authorName: string; count: number }>>;
  
  abstract getMostCommentedTargets(
    targetType: CommentTarget,
    limit: number
  ): Promise<Array<{ targetId: string; targetTitle: string; count: number }>>;
}
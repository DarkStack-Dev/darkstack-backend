// src/domain/repositories/like/like.gateway.repository.ts
import { Like, LikeTarget } from '@/domain/entities/like/like.entity';

export type LikeSearchFilters = {
  targetId?: string;
  targetType?: LikeTarget;
  userId?: string;
  isLike?: boolean; // true = likes, false = dislikes
  limit?: number;
  offset?: number;
  orderBy?: 'createdAt' | 'updatedAt';
  orderDirection?: 'asc' | 'desc';
};

export type LikeWithUser = {
  like: Like;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
};

export type PaginatedLikeResult = {
  likes: LikeWithUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type LikeStatistics = {
  totalLikes: number;
  totalDislikes: number;
  likesCount: number;
  dislikesCount: number;
  netLikes: number; // likes - dislikes
  likeRatio: number; // likes / (likes + dislikes)
  topLikedTargets: Array<{
    targetId: string;
    targetType: LikeTarget;
    targetTitle: string;
    likesCount: number;
    dislikesCount: number;
    netLikes: number;
  }>;
  topLikers: Array<{
    userId: string;
    userName: string;
    totalGiven: number;
    likesGiven: number;
    dislikesGiven: number;
  }>;
};

export type LikeCounts = {
  likesCount: number;
  dislikesCount: number;
  netLikes: number;
  currentUserLike?: 'LIKE' | 'DISLIKE' | null;
};

export abstract class LikeGatewayRepository {
  // 🔍 CRUD Básico
  abstract findById(id: string): Promise<Like | null>;
  abstract findByIdWithUser(id: string): Promise<LikeWithUser | null>;
  abstract create(like: Like): Promise<void>;
  abstract update(like: Like): Promise<void>;
  abstract delete(id: string): Promise<void>;

  // 📋 Busca e Listagem
  abstract findAll(filters?: LikeSearchFilters): Promise<PaginatedLikeResult>;
  abstract findByUser(
    userId: string,
    filters?: Omit<LikeSearchFilters, 'userId'>
  ): Promise<PaginatedLikeResult>;
  abstract findByTarget(
    targetId: string,
    targetType: LikeTarget,
    filters?: Omit<LikeSearchFilters, 'targetId' | 'targetType'>
  ): Promise<PaginatedLikeResult>;

  // 🎯 Busca Específica
  abstract findUserLikeOnTarget(
    userId: string,
    targetId: string,
    targetType: LikeTarget
  ): Promise<Like | null>;

  // 📊 Contadores e Estatísticas
  abstract count(filters?: Partial<LikeSearchFilters>): Promise<number>;
  abstract countByTarget(
    targetId: string,
    targetType: LikeTarget,
    isLike?: boolean
  ): Promise<number>;
  abstract countByUser(userId: string, isLike?: boolean): Promise<number>;
  abstract getLikeCounts(
    targetId: string,
    targetType: LikeTarget,
    currentUserId?: string
  ): Promise<LikeCounts>;
  abstract getStatistics(
    targetId?: string,
    targetType?: LikeTarget
  ): Promise<LikeStatistics>;

  // 🔄 Operações de Like/Dislike
  abstract toggleLike(
    userId: string,
    targetId: string,
    targetType: LikeTarget
  ): Promise<'CREATED' | 'UPDATED' | 'REMOVED'>;
  abstract removeLike(
    userId: string,
    targetId: string,
    targetType: LikeTarget
  ): Promise<boolean>;

  // 🔄 Atualização de Contadores nas Entidades
  abstract updateTargetLikeCounts(targetId: string, targetType: LikeTarget): Promise<void>;

  // 🔍 Verificações
  abstract exists(
    userId: string,
    targetId: string,
    targetType: LikeTarget
  ): Promise<boolean>;
  abstract canUserLike(
    userId: string,
    targetId: string,
    targetType: LikeTarget
  ): Promise<boolean>;

  // 📈 Analytics
  abstract getMostLikedTargets(
    targetType: LikeTarget,
    limit: number,
    timeRange?: { start: Date; end: Date }
  ): Promise<Array<{
    targetId: string;
    targetTitle: string;
    likesCount: number;
    dislikesCount: number;
    netLikes: number;
  }>>;

  abstract getMostActiveLikers(
    limit: number,
    targetType?: LikeTarget,
    timeRange?: { start: Date; end: Date }
  ): Promise<Array<{
    userId: string;
    userName: string;
    totalGiven: number;
    likesGiven: number;
    dislikesGiven: number;
  }>>;

  abstract getLikesByDateRange(
    startDate: Date,
    endDate: Date,
    targetId?: string,
    targetType?: LikeTarget
  ): Promise<Array<{ date: string; likes: number; dislikes: number }>>;
}
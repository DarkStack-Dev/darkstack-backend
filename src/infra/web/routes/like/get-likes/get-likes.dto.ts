// src/infra/web/routes/like/get-likes/get-likes.dto.ts
import { LikeTarget } from '@/domain/entities/like/like.entity';

export type GetLikesRequest = {
  isLike?: boolean; // true = apenas likes, false = apenas dislikes
  page?: number;
  pageSize?: number;
  orderBy?: 'createdAt' | 'updatedAt';
  orderDirection?: 'asc' | 'desc';
};

export type GetLikesResponse = {
  likes: Array<{
    id: string;
    userId: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    isLike: boolean;
    createdAt: Date;
  }>;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  summary: {
    likesCount: number;
    dislikesCount: number;
    netLikes: number;
  };
  targetInfo: {
    targetId: string;
    targetType: LikeTarget;
  };
};
// src/infra/web/routes/like/toggle/toggle-like.dto.ts
import { LikeTarget } from '@/domain/entities/like/like.entity';

export type ToggleLikeRequest = {
  targetId: string;
  targetType: LikeTarget;
  isLike?: boolean; // true = like, false = dislike, undefined = toggle
};

export type ToggleLikeResponse = {
  id?: string;
  userId: string;
  targetId: string;
  targetType: LikeTarget;
  isLike?: boolean;
  action: 'CREATED' | 'UPDATED' | 'REMOVED';
  likeCounts: {
    likesCount: number;
    dislikesCount: number;
    netLikes: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
  message: string;
};
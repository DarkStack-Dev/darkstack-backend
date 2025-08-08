// src/infra/web/routes/like/get-counts/get-like-counts.dto.ts
import { LikeTarget } from '@/domain/entities/like/like.entity';

export type GetLikeCountsResponse = {
  targetId: string;
  targetType: LikeTarget;
  likesCount: number;
  dislikesCount: number;
  netLikes: number;
  currentUserLike: 'LIKE' | 'DISLIKE' | null;
  likeRatio: number; // likes / (likes + dislikes)
};
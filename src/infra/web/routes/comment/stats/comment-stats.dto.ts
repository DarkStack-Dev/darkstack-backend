// src/infra/web/routes/comment/stats/comment-stats.dto.ts
import { CommentTarget } from '@/domain/entities/comment/comment.entity';

export type CommentStatsRequest = {
  targetId?: string;
  targetType?: CommentTarget;
};

export type CommentStatsResponse = {
  overview: {
    totalComments: number;
    totalApproved: number;
    totalPending: number;
    totalRejected: number;
    totalDeleted: number;
  };
  timeframe: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  topAuthors: Array<{
    authorId: string;
    authorName: string;
    count: number;
  }>;
  byTargetType?: Record<CommentTarget, number>;
  mostCommented?: Array<{
    targetId: string;
    targetTitle: string;
    count: number;
  }>;
  trends: Array<{
    date: string;
    count: number;
  }>;
};
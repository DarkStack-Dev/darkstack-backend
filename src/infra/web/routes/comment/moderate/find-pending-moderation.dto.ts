// src/infra/web/routes/comment/moderate/find-pending-moderation.dto.ts
import { CommentTarget } from '@/domain/entities/comment/comment.entity';

export type FindPendingModerationRequest = {
  page?: number;
  pageSize?: number;
  targetType?: CommentTarget;
};

export type FindPendingModerationResponse = {
  comments: Array<{
    id: string;
    content: string;
    authorId: string;
    author: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    targetId: string;
    targetType: CommentTarget;
    targetInfo: {
      title: string;
      url?: string;
    };
    parentId?: string;
    parentInfo?: {
      id: string;
      content: string;
      authorName: string;
    };
    createdAt: Date;
    pendingDays: number;
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
    totalPending: number;
    oldestPendingDays: number;
    byTargetType: Record<CommentTarget, number>;
  };
};
// src/infra/web/routes/comment/count/count-comments.dto.ts
import { CommentTarget } from '@/domain/entities/comment/comment.entity';

export type CountCommentsResponse = {
  targetId: string;
  targetType: CommentTarget;
  totalComments: number;
  totalApproved: number;
  totalPending: number;
  totalRejected: number;
  breakdown: {
    rootComments: number;
    replies: number;
  };
};
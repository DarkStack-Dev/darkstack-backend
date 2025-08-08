// src/infra/web/routes/comment/create/create-comment.dto.ts
import { CommentTarget } from '@/domain/entities/comment/comment.entity';

export type CreateCommentRequest = {
  content: string;
  targetId: string;
  targetType: CommentTarget;
  parentId?: string;
};

export type CreateCommentResponse = {
  id: string;
  content: string;
  authorId: string;
  targetId: string;
  targetType: CommentTarget;
  parentId?: string;
  approved: boolean;
  needsModeration?: boolean;
  createdAt: Date;
  message?: string;
};
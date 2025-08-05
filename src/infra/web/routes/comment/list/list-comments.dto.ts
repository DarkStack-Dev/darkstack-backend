// src/infra/web/routes/comment/list/list-comments.dto.ts
import { CommentTarget } from '@/domain/entities/comment/comment.entity';

export type ListCommentsRequest = {
  page?: number;
  pageSize?: number;
  orderBy?: 'createdAt' | 'repliesCount';
  orderDirection?: 'asc' | 'desc';
  includeReplies?: boolean;
};

export type ListCommentsResponse = {
  comments: Array<{
    id: string;
    content: string;
    isEdited: boolean;
    isDeleted: boolean;
    authorId: string;
    author: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    parentId?: string;
    repliesCount: number;
    approved: boolean;
    createdAt: Date;
    updatedAt: Date;
    canEdit: boolean;
    canDelete: boolean;
    replies?: Array<{
      id: string;
      content: string;
      isEdited: boolean;
      authorId: string;
      author: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
      };
      createdAt: Date;
      canEdit: boolean;
      canDelete: boolean;
    }>;
  }>;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  targetInfo: {
    targetId: string;
    targetType: CommentTarget;
    totalComments: number;
  };
};
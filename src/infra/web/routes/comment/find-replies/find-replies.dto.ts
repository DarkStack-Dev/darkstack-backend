// src/infra/web/routes/comment/find-replies/find-replies.dto.ts
export type FindRepliesRequest = {
  page?: number;
  pageSize?: number;
  orderBy?: 'createdAt';
  orderDirection?: 'asc' | 'desc';
};

export type FindRepliesResponse = {
  replies: Array<{
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
    parentId: string;
    approved: boolean;
    createdAt: Date;
    updatedAt: Date;
    canEdit: boolean;
    canDelete: boolean;
  }>;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  parentComment: {
    id: string;
    authorId: string;
    content: string;
    createdAt: Date;
  };
};

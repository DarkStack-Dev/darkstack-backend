// src/infra/web/routes/like/my-likes/my-likes.dto.ts
export type MyLikesRequest = {
  targetType?: string;
  isLike?: boolean;
  page?: number;
  pageSize?: number;
  orderBy?: 'createdAt' | 'updatedAt';
  orderDirection?: 'asc' | 'desc';
};

export type MyLikesResponse = {
  likes: Array<{
    id: string;
    targetId: string;
    targetType: string;
    targetTitle: string;
    isLike: boolean;
    createdAt: Date;
    targetUrl?: string;
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
    totalLikes: number;
    totalDislikes: number;
    totalGiven: number;
    byTargetType: Record<string, number>;
  };
};

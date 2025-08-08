// src/domain/usecases/like/get-likes/get-likes.usecase.ts
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { LikeGatewayRepository, LikeWithUser, PaginatedLikeResult } from '@/domain/repositories/like/like.gateway.repository';
import { LikeTarget } from '@/domain/entities/like/like.entity';

export type GetLikesInput = {
  targetId: string;
  targetType: LikeTarget;
  isLike?: boolean; // true = apenas likes, false = apenas dislikes, undefined = ambos
  page?: number;
  pageSize?: number;
  orderBy?: 'createdAt' | 'updatedAt';
  orderDirection?: 'asc' | 'desc';
};

export type GetLikesOutput = {
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
};

@Injectable()
export class GetLikesUseCase implements UseCase<GetLikesInput, GetLikesOutput> {
  constructor(
    private readonly likeRepository: LikeGatewayRepository,
  ) {}

  async execute(input: GetLikesInput): Promise<GetLikesOutput> {
    const page = input.page || 1;
    const pageSize = Math.min(input.pageSize || 20, 100);
    const offset = (page - 1) * pageSize;

    // Buscar likes
    const result = await this.likeRepository.findByTarget(
      input.targetId,
      input.targetType,
      {
        isLike: input.isLike,
        limit: pageSize,
        offset,
        orderBy: input.orderBy || 'createdAt',
        orderDirection: input.orderDirection || 'desc',
      }
    );

    // Buscar estatísticas
    const likeCounts = await this.likeRepository.getLikeCounts(
      input.targetId,
      input.targetType
    );

    const likes = result.likes.map(item => ({
      id: item.like.getId(),
      userId: item.like.getUserId(),
      user: item.user,
      isLike: item.like.getIsLike(),
      createdAt: item.like.getCreatedAt(),
    }));

    return {
      likes,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrevious: result.hasPrevious,
      },
      summary: {
        likesCount: likeCounts.likesCount,
        dislikesCount: likeCounts.dislikesCount,
        netLikes: likeCounts.netLikes,
      },
    };
  }
}
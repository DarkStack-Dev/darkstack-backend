// src/domain/usecases/like/get-like-counts/get-like-counts.usecase.ts
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { LikeGatewayRepository, LikeCounts } from '@/domain/repositories/like/like.gateway.repository';
import { LikeTarget } from '@/domain/entities/like/like.entity';

export type GetLikeCountsInput = {
  targetId: string;
  targetType: LikeTarget;
  currentUserId?: string;
};

export type GetLikeCountsOutput = {
  targetId: string;
  targetType: LikeTarget;
  likesCount: number;
  dislikesCount: number;
  netLikes: number;
  currentUserLike: 'LIKE' | 'DISLIKE' | null;
};

@Injectable()
export class GetLikeCountsUseCase implements UseCase<GetLikeCountsInput, GetLikeCountsOutput> {
  constructor(
    private readonly likeRepository: LikeGatewayRepository,
  ) {}

  async execute(input: GetLikeCountsInput): Promise<GetLikeCountsOutput> {
    const likeCounts = await this.likeRepository.getLikeCounts(
      input.targetId,
      input.targetType,
      input.currentUserId
    );

    return {
      targetId: input.targetId,
      targetType: input.targetType,
      likesCount: likeCounts.likesCount,
      dislikesCount: likeCounts.dislikesCount,
      netLikes: likeCounts.netLikes,
      currentUserLike: likeCounts.currentUserLike,
    };
  }
}
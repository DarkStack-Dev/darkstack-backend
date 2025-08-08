// src/usecases/like/get-counts/get-like-counts.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { GetLikeCountsUseCase as DomainGetLikeCountsUseCase } from '@/domain/usecases/like/get-like-counts/get-like-counts.usecase';
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
export class GetLikeCountsUsecase implements Usecase<GetLikeCountsInput, GetLikeCountsOutput> {
  constructor(
    private readonly domainGetLikeCountsUseCase: DomainGetLikeCountsUseCase,
  ) {}

  async execute(input: GetLikeCountsInput): Promise<GetLikeCountsOutput> {
    try {
      // 1. Delegar para Domain Use Case
      const output = await this.domainGetLikeCountsUseCase.execute(input);

      return output;

    } catch (error) {
      this.handleDomainExceptions(error);
      throw error;
    }
  }

  private handleDomainExceptions(error: any): void {
    // Mapear exceptions se necessário
  }
}
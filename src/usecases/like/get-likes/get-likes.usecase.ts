// src/usecases/like/get-likes/get-likes.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { GetLikesUseCase as DomainGetLikesUseCase } from '@/domain/usecases/like/get-likes/get-likes.usecase';
import { LikeTarget } from '@/domain/entities/like/like.entity';

export type GetLikesInput = {
  targetId: string;
  targetType: LikeTarget;
  isLike?: boolean;
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
export class GetLikesUsecase implements Usecase<GetLikesInput, GetLikesOutput> {
  constructor(
    private readonly domainGetLikesUseCase: DomainGetLikesUseCase,
  ) {}

  async execute(input: GetLikesInput): Promise<GetLikesOutput> {
    try {
      // 1. Delegar para Domain Use Case
      const output = await this.domainGetLikesUseCase.execute(input);

      // 2. Application layer pode adicionar informações de infraestrutura
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
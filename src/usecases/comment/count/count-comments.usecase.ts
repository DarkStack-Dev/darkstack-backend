// src/usecases/comment/count/count-comments.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { CommentGatewayRepository } from '@/domain/repositories/comment/comment.gateway.repository';
import { CommentTarget } from '@/domain/entities/comment/comment.entity';

export type CountCommentsInput = {
  targetId: string;
  targetType: CommentTarget;
};

export type CountCommentsOutput = {
  targetId: string;
  targetType: CommentTarget;
  totalComments: number;
  totalApproved: number;
  totalPending: number;
  totalRejected: number;
  rootComments: number;
  replies: number;
};

@Injectable()
export class CountCommentsUsecase implements Usecase<CountCommentsInput, CountCommentsOutput> {
  constructor(
    private readonly commentRepository: CommentGatewayRepository,
  ) {}

  async execute(input: CountCommentsInput): Promise<CountCommentsOutput> {
    const [
      totalComments,
      totalApproved,
      totalPending,
      rootCommentsResult,
    ] = await Promise.all([
      this.commentRepository.countByTarget(input.targetId, input.targetType, undefined),
      this.commentRepository.countByTarget(input.targetId, input.targetType, true),
      this.commentRepository.count({
        targetId: input.targetId,
        targetType: input.targetType,
        approved: false,
        isDeleted: false,
      }),
      this.commentRepository.count({
        targetId: input.targetId,
        targetType: input.targetType,
        parentId: null,
        approved: true,
        isDeleted: false,
      }),
    ]);

    const totalRejected = totalComments - totalApproved - totalPending;
    const replies = totalApproved - rootCommentsResult;

    return {
      targetId: input.targetId,
      targetType: input.targetType,
      totalComments,
      totalApproved,
      totalPending,
      totalRejected: Math.max(0, totalRejected),
      rootComments: rootCommentsResult,
      replies: Math.max(0, replies),
    };
  }
}
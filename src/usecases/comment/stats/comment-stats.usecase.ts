// src/usecases/comment/stats/comment-stats.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { CommentGatewayRepository } from '@/domain/repositories/comment/comment.gateway.repository';
import { CommentTarget } from '@/domain/entities/comment/comment.entity';

export type CommentStatsInput = {
  targetId?: string;
  targetType?: CommentTarget;
};

export type CommentStatsOutput = {
  totalComments: number;
  totalApproved: number;
  totalPending: number;
  totalRejected: number;
  totalDeleted: number;
  commentsToday: number;
  commentsThisWeek: number;
  commentsThisMonth: number;
  topAuthors: Array<{
    authorId: string;
    authorName: string;
    count: number;
  }>;
  byTargetType?: Record<CommentTarget, number>;
  mostCommented?: Array<{
    targetId: string;
    targetTitle: string;
    count: number;
  }>;
  trends: Array<{
    date: string;
    count: number;
  }>;
};

@Injectable()
export class CommentStatsUsecase implements Usecase<CommentStatsInput, CommentStatsOutput> {
  constructor(
    private readonly commentRepository: CommentGatewayRepository,
  ) {}

  async execute(input: CommentStatsInput): Promise<CommentStatsOutput> {
    // Buscar estatísticas básicas
    const stats = await this.commentRepository.getStatistics(input.targetId, input.targetType);

    // Buscar trends dos últimos 30 dias
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const [trends, byTargetType, mostCommented] = await Promise.all([
      this.commentRepository.getCommentsByDateRange(startDate, endDate, input.targetId, input.targetType),
      input.targetId ? undefined : this.calculateByTargetTypeStats(),
      input.targetType && !input.targetId 
        ? this.commentRepository.getMostCommentedTargets(input.targetType, 10)
        : undefined,
    ]);

    return {
      totalComments: stats.totalComments,
      totalApproved: stats.totalApproved,
      totalPending: stats.totalPending,
      totalRejected: stats.totalRejected,
      totalDeleted: stats.totalDeleted,
      commentsToday: stats.commentsToday,
      commentsThisWeek: stats.commentsThisWeek,
      commentsThisMonth: stats.commentsThisMonth,
      topAuthors: stats.topAuthors,
      byTargetType,
      mostCommented,
      trends,
    };
  }

  private async calculateByTargetTypeStats(): Promise<Record<CommentTarget, number>> {
    const targetTypes: CommentTarget[] = ['ARTICLE', 'PROJECT', 'ISSUE', 'QA'];
    const stats = {} as Record<CommentTarget, number>;

    await Promise.all(
      targetTypes.map(async (targetType) => {
        const count = await this.commentRepository.count({
          targetType,
          approved: true,
          isDeleted: false,
        });
        stats[targetType] = count;
      })
    );

    return stats;
  }
}
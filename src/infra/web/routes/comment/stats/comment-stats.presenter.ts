// src/infra/web/routes/comment/stats/comment-stats.presenter.ts
import { CommentStatsOutput } from '@/usecases/comment/stats/comment-stats.usecase';
import { CommentStatsResponse } from './comment-stats.dto';

export class CommentStatsPresenter {
  public static toHttp(output: CommentStatsOutput): CommentStatsResponse {
    return {
      overview: {
        totalComments: output.totalComments,
        totalApproved: output.totalApproved,
        totalPending: output.totalPending,
        totalRejected: output.totalRejected,
        totalDeleted: output.totalDeleted,
      },
      timeframe: {
        today: output.commentsToday,
        thisWeek: output.commentsThisWeek,
        thisMonth: output.commentsThisMonth,
      },
      topAuthors: output.topAuthors,
      byTargetType: output.byTargetType,
      mostCommented: output.mostCommented,
      trends: output.trends,
    };
  }
}
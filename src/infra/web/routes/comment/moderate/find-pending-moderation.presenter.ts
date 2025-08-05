// src/infra/web/routes/comment/moderate/find-pending-moderation.presenter.ts
import { FindPendingModerationOutput } from '@/usecases/comment/moderate/find-pending-moderation.usecase';
import { FindPendingModerationResponse } from './find-pending-moderation.dto';

export class FindPendingModerationPresenter {
  public static toHttp(output: FindPendingModerationOutput): FindPendingModerationResponse {
    return {
      comments: output.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        authorId: comment.authorId,
        author: {
          id: comment.author.id,
          name: comment.author.name,
          email: comment.author.email,
          avatar: comment.author.avatar,
        },
        targetId: comment.targetId,
        targetType: comment.targetType,
        targetInfo: {
          title: comment.targetInfo.title,
          url: comment.targetInfo.url,
        },
        parentId: comment.parentId,
        parentInfo: comment.parentInfo,
        createdAt: comment.createdAt,
        pendingDays: comment.pendingDays,
      })),
      pagination: output.pagination,
      summary: {
        totalPending: output.summary.totalPending,
        oldestPendingDays: output.summary.oldestPendingDays,
        byTargetType: output.summary.byTargetType,
      },
    };
  }
}

// src/infra/web/routes/comment/count/count-comments.presenter.ts
import { CountCommentsOutput } from '@/usecases/comment/count/count-comments.usecase';
import { CountCommentsResponse } from './count-comments.dto';

export class CountCommentsPresenter {
  public static toHttp(output: CountCommentsOutput): CountCommentsResponse {
    return {
      targetId: output.targetId,
      targetType: output.targetType,
      totalComments: output.totalComments,
      totalApproved: output.totalApproved,
      totalPending: output.totalPending,
      totalRejected: output.totalRejected,
      breakdown: {
        rootComments: output.rootComments,
        replies: output.replies,
      },
    };
  }
}
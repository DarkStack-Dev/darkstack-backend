// src/infra/web/routes/comment/moderate/reject-comment.presenter.ts
import { RejectCommentOutput } from '@/usecases/comment/moderate/reject-comment.usecase';
import { RejectCommentResponse } from './reject-comment.dto';

export class RejectCommentPresenter {
  public static toHttp(output: RejectCommentOutput): RejectCommentResponse {
    return {
      id: output.id,
      approved: output.approved,
      rejectedAt: output.rejectedAt,
      rejectedBy: output.rejectedBy,
      rejectionReason: output.rejectionReason,
      message: 'Comentário rejeitado com sucesso',
    };
  }
}
// src/infra/web/routes/comment/moderate/approve-comment.presenter.ts
import { ApproveCommentOutput } from '@/usecases/comment/moderate/approve-comment.usecase';
import { ApproveCommentResponse } from './approve-comment.dto';

export class ApproveCommentPresenter {
  public static toHttp(output: ApproveCommentOutput): ApproveCommentResponse {
    return {
      id: output.id,
      approved: output.approved,
      approvedAt: output.approvedAt,
      approvedBy: output.approvedBy,
      message: 'Comentário aprovado com sucesso',
    };
  }
}
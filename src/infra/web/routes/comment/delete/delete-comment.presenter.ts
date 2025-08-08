// src/infra/web/routes/comment/delete/delete-comment.presenter.ts
import { DeleteCommentOutput } from '@/usecases/comment/delete/delete-comment.usecase';
import { DeleteCommentResponse } from './delete-comment.dto';

export class DeleteCommentPresenter {
  public static toHttp(output: DeleteCommentOutput): DeleteCommentResponse {
    return {
      id: output.id,
      isDeleted: output.isDeleted,
      updatedAt: output.updatedAt,
      message: 'Comentário removido com sucesso',
    };
  }
}
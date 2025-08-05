// src/infra/web/routes/comment/update/update-comment.presenter.ts
import { UpdateCommentOutput } from '@/usecases/comment/update/update-comment.usecase';
import { UpdateCommentResponse } from './update-comment.dto';

export class UpdateCommentPresenter {
  public static toHttp(output: UpdateCommentOutput): UpdateCommentResponse {
    return {
      id: output.id,
      content: output.content,
      isEdited: output.isEdited,
      updatedAt: output.updatedAt,
      message: 'Comentário atualizado com sucesso',
    };
  }
}

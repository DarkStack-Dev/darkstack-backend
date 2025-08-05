// src/infra/web/routes/comment/create/create-comment.presenter.ts
import { CreateCommentOutput } from '@/usecases/comment/create/create-comment.usecase';
import { CreateCommentResponse } from './create-comment.dto';

export class CreateCommentPresenter {
  public static toHttp(output: CreateCommentOutput): CreateCommentResponse {
    return {
      id: output.id,
      content: output.content,
      authorId: output.authorId,
      targetId: output.targetId,
      targetType: output.targetType,
      parentId: output.parentId,
      approved: output.approved,
      needsModeration: output.needsModeration,
      createdAt: output.createdAt,
      message: output.needsModeration 
        ? 'Comentário criado e enviado para moderação'
        : 'Comentário criado com sucesso',
    };
  }
}
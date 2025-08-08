// src/infra/web/routes/like/toggle/toggle-like.presenter.ts
import { ToggleLikeOutput } from '@/usecases/like/toggle/toggle-like.usecase';
import { ToggleLikeResponse } from './toggle-like.dto';

export class ToggleLikePresenter {
  public static toHttp(output: ToggleLikeOutput): ToggleLikeResponse {
    let message = '';
    switch (output.action) {
      case 'CREATED':
        message = output.isLike ? 'Like adicionado!' : 'Dislike adicionado!';
        break;
      case 'UPDATED':
        message = output.isLike ? 'Mudou para like!' : 'Mudou para dislike!';
        break;
      case 'REMOVED':
        message = 'Like/Dislike removido!';
        break;
    }

    return {
      id: output.id,
      userId: output.userId,
      targetId: output.targetId,
      targetType: output.targetType,
      isLike: output.isLike,
      action: output.action,
      likeCounts: output.likeCounts,
      createdAt: output.createdAt,
      updatedAt: output.updatedAt,
      message,
    };
  }
}
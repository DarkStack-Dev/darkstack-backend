// src/infra/web/routes/article/create/create-article.presenter.ts - WEBSOCKET VERSION
import { CreateArticleOutput } from '@/usecases/article/create/create-article.usecase';
import { CreateArticleResponse } from './create-article.dto';

export class CreateArticlePresenter {
  public static toHttp(output: CreateArticleOutput): CreateArticleResponse {
    return {
      id: output.id,
      titulo: output.titulo,
      slug: output.slug,
      status: output.status,
      createdAt: output.createdAt,
      message: output.message,
      moderatorsNotified: output.moderatorsNotified,
      realTimeNotification: output.realTimeNotificationSent,
    };
  }
}
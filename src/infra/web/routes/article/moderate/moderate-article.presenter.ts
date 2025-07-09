// src/infra/web/routes/article/moderate/moderate-article.presenter.ts
import { ModerateArticleOutput } from '@/usecases/article/moderate/moderate-article.usecase';
import { ModerateArticleResponse } from './moderate-article.dto';

export class ModerateArticlePresenter {
  public static toHttp(output: ModerateArticleOutput): ModerateArticleResponse {
    return {
      success: output.success,
      message: output.message,
      article: {
        id: output.article.id,
        titulo: output.article.titulo,
        status: output.article.status,
        author: output.article.author,
      },
      moderator: output.moderator,
      moderatedAt: output.moderatedAt,
    };
  }
}
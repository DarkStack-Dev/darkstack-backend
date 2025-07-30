// src/infra/web/routes/article/my-articles/my-articles.presenter.ts
import { MyArticlesOutput } from '@/usecases/article/my-articles/my-articles.usecase';
import { MyArticlesResponse } from './my-articles.dto';

export class MyArticlesPresenter {
  public static toHttp(output: MyArticlesOutput): MyArticlesResponse {
    return {
      articles: output.articles,
      pagination: output.pagination,
      stats: output.stats,
    };
  }
}
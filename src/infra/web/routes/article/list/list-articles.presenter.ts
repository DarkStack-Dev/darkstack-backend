// src/infra/web/routes/article/list/list-articles.presenter.ts
import { ListArticlesOutput } from '@/usecases/article/list/list-articles.usecase';
import { ListArticlesResponse } from './list-articles.dto';

export class ListArticlesPresenter {
  public static toHttp(output: ListArticlesOutput): ListArticlesResponse {
    return {
      articles: output.articles,
      pagination: output.pagination,
    };
  }
}
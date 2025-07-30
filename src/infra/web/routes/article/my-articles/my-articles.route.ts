// src/infra/web/routes/article/my-articles/my-articles.route.ts
import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { MyArticlesUsecase } from '@/usecases/article/my-articles/my-articles.usecase';
import { MyArticlesQuery, MyArticlesResponse } from './my-articles.dto';
import { MyArticlesPresenter } from './my-articles.presenter';

@Controller('/articlesa')
export class MyArticlesRoute {
  constructor(
    private readonly myArticlesUsecase: MyArticlesUsecase,
  ) {}

  @Get('/my-articles')
  public async handle(
    @Query() query: MyArticlesQuery,
    @Req() req: Request,
  ): Promise<MyArticlesResponse> {
    const userId = req['userId'];

    console.log(`📋 Buscando meus artigos para usuário ${userId}`);

    const output = await this.myArticlesUsecase.execute({
      userId,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 10,
      status: query.status,
    });

    console.log(`✅ Encontrados ${output.articles.length} artigos do usuário ${userId}`);

    return MyArticlesPresenter.toHttp(output);
  }
}

// src/infra/web/routes/article/create/create-article.route.ts - WEBSOCKET VERSION
import { Controller, Post, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { CreateArticleUsecase } from '@/usecases/article/create/create-article.usecase';
import { CreateArticleRequest, CreateArticleResponse } from './create-article.dto';
import { CreateArticlePresenter } from './create-article.presenter';

@Controller('/articles')
export class CreateArticleRoute {
  constructor(
    private readonly createArticleUsecase: CreateArticleUsecase,
  ) {}

  @Post()
  public async handle(
    @Body() request: CreateArticleRequest,
    @Req() req: Request,
  ): Promise<CreateArticleResponse> {

    const userId = req['userId'];

    console.log(`📝 [CreateArticleRoute] User ${userId} creating article: ${request.titulo}`);

    const output = await this.createArticleUsecase.execute({
      titulo: request.titulo,
      descricao: request.descricao,
      conteudo: request.conteudo,
      categoria: request.categoria,
      tags: request.tags,
      images: request.images || [],
      userId,
    });

    console.log(`✅ [CreateArticleRoute] Article created. Real-time notifications sent: ${output.realTimeNotificationSent}`);

    return CreateArticlePresenter.toHttp(output);
  }
}
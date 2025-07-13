// src/infra/web/routes/article/find-by-id/find-article-by-id.route.ts
import { Controller, Get, Param, Req, Query } from '@nestjs/common';
import { Request } from 'express';
import { FindArticleByIdUsecase } from '@/usecases/article/find-by-id/find-article-by-id.usecase';
import { FindArticleByIdResponse } from './find-article-by-id.dto';
import { FindArticleByIdPresenter } from './find-article-by-id.presenter';
import { IsPublic } from '@/infra/web/auth/decorators/is-public.decorator';

@Controller('/articles')
export class FindArticleByIdRoute {
  constructor(
    private readonly findArticleByIdUsecase: FindArticleByIdUsecase,
  ) {}

  @Get('/:id')
  // @IsPublic() // Artigos públicos podem ser vistos sem autenticação
  public async handle(
    @Param('id') articleId: string,
    @Query('includeContent') includeContent: string,
    @Req() req: Request,
  ): Promise<FindArticleByIdResponse> {
    const currentUserId = req['userId']; // Pode ser undefined se não autenticado
    const shouldIncludeContent = includeContent !== 'false';

    console.log(`🔍 Buscando artigo ${articleId} ${currentUserId ? `para usuário ${currentUserId}` : '(público)'}`);

    const output = await this.findArticleByIdUsecase.execute({
      id: articleId,
      currentUserId,
      includeContent: shouldIncludeContent,
    });

    return FindArticleByIdPresenter.toHttp(output);
  }
}
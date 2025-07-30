// src/infra/web/routes/article/find-by-slug/find-article-by-slug.route.ts - CORRIGIDO
import { Controller, Get, Param, Req, Query } from '@nestjs/common';
import { Request } from 'express';
import { FindArticleBySlugUsecase } from '@/usecases/article/find-by-slug/find-article-by-slug.usecase';
import { FindArticleByIdResponse } from '../find-by-id/find-article-by-id.dto';
import { FindArticleByIdPresenter } from '../find-by-id/find-article-by-id.presenter';
import { IsPublic } from '@/infra/web/auth/decorators/is-public.decorator';

@Controller('/articles')
export class FindArticleBySlugRoute {
  constructor(
    private readonly findArticleBySlugUsecase: FindArticleBySlugUsecase, // ✅ Usando caso de uso
  ) {}

  @Get('/slug/:slug')
  @IsPublic()
  public async handle(
    @Param('slug') slug: string,
    @Query('includeContent') includeContent: string,
    @Req() req: Request,
  ): Promise<FindArticleByIdResponse> {
    const currentUserId = req['userId'];
    const shouldIncludeContent = includeContent !== 'false';

    console.log(`🔍 Buscando artigo por slug: ${slug} ${currentUserId ? `para usuário ${currentUserId}` : '(público)'}`);

    const output = await this.findArticleBySlugUsecase.execute({
      slug,
      currentUserId,
      includeContent: shouldIncludeContent,
    });

    return FindArticleByIdPresenter.toHttp(output);
  }
}
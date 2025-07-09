// src/infra/web/routes/article/find-by-slug/find-article-by-slug.route.ts
import { Controller, Get, Param, Req, Query } from '@nestjs/common';
import { Request } from 'express';
import { ArticleGatewayRepository } from '@/domain/repositories/article/article.gateway.repository';
import { FindArticleByIdUsecase } from '@/usecases/article/find-by-id/find-article-by-id.usecase';
import { FindArticleByIdResponse } from '../find-by-id/find-article-by-id.dto';
import { FindArticleByIdPresenter } from '../find-by-id/find-article-by-id.presenter';
import { IsPublic } from '@/infra/web/auth/decorators/is-public.decorator';
import { ArticleNotFoundUsecaseException } from '@/usecases/exceptions/article/article-not-found.usecase.exception';

@Controller('/articles')
export class FindArticleBySlugRoute {
  constructor(
    private readonly articleRepository: ArticleGatewayRepository,
    private readonly findArticleByIdUsecase: FindArticleByIdUsecase,
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

    console.log(`🔍 Buscando artigo por slug: ${slug}`);

    // Buscar artigo pelo slug primeiro
    const article = await this.articleRepository.findBySlug(slug, false);
    if (!article) {
      throw new ArticleNotFoundUsecaseException(
        `Article not found with slug ${slug}`,
        'Artigo não encontrado',
        FindArticleBySlugRoute.name,
      );
    }

    // Usar o usecase existente com o ID encontrado
    const output = await this.findArticleByIdUsecase.execute({
      id: article.getId(),
      currentUserId,
      includeContent: shouldIncludeContent,
    });

    return FindArticleByIdPresenter.toHttp(output);
  }
}
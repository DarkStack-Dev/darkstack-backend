// src/infra/web/routes/article/list/list-articles.route.ts
import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { ListArticlesUsecase } from '@/usecases/article/list/list-articles.usecase';
import { ListArticlesQuery, ListArticlesResponse } from './list-articles.dto';
import { ListArticlesPresenter } from './list-articles.presenter';
import { IsPublic } from '@/infra/web/auth/decorators/is-public.decorator';
import { ArticleCategory, ArticleStatus } from 'generated/prisma';

@Controller('/articles')
export class ListArticlesRoute {
  constructor(
    private readonly listArticlesUsecase: ListArticlesUsecase,
  ) {}

  @Get()
  @IsPublic() // Listar artigos públicos
  public async handle(
    @Query() query: ListArticlesQuery,
    @Req() req: Request,
  ): Promise<ListArticlesResponse> {
    const currentUserId = req['userId'];

    console.log(`📋 Listando artigos - filtros:`, query);

    // Processar tags da query (comma-separated)
    let tagsFilter: string[] | undefined;
    if (query.tags) {
      tagsFilter = query.tags.split(',').map(tag => tag.trim());
    }

    const output = await this.listArticlesUsecase.execute({
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 20,
      search: query.search,
      categoria: query.categoria,
      tags: tagsFilter,
      authorId: query.authorId,
      status: query.status || ArticleStatus.APPROVED, // Por padrão, apenas aprovados
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
      currentUserId,
      includeContent: query.includeContent === 'true',
    });

    console.log(`✅ Encontrados ${output.articles.length} artigos de ${output.pagination.total} total`);

    return ListArticlesPresenter.toHttp(output);
  }
}

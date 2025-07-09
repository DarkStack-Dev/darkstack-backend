// src/infra/web/routes/article/moderate/moderate-article.route.ts
import { Controller, Post, Param, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { ModerateArticleUsecase } from '@/usecases/article/moderate/moderate-article.usecase';
import { ModerateArticleRequest, ModerateArticleResponse } from './moderate-article.dto';
import { ModerateArticlePresenter } from './moderate-article.presenter';
import { Roles } from '@/infra/web/auth/decorators/roles.decorator';

@Controller('/articles')
export class ModerateArticleRoute {
  constructor(
    private readonly moderateArticleUsecase: ModerateArticleUsecase,
  ) {}

  @Post('/:id/moderate')
  @Roles('ADMIN', 'MODERATOR')
  public async handle(
    @Param('id') articleId: string,
    @Body() request: ModerateArticleRequest,
    @Req() req: Request,
  ): Promise<ModerateArticleResponse> {
    const moderatorId = req['userId'];
    const moderatorRoles = req['user']?.roles || [];

    console.log(`🛡️ Moderando artigo ${articleId}: ${request.action} por ${moderatorId}`);

    const output = await this.moderateArticleUsecase.execute({
      articleId,
      moderatorId,
      moderatorRoles,
      action: request.action,
      rejectionReason: request.rejectionReason,
    });

    console.log(`✅ Artigo ${output.article.titulo} ${request.action === 'approve' ? 'aprovado' : 'rejeitado'}`);

    return ModerateArticlePresenter.toHttp(output);
  }
}
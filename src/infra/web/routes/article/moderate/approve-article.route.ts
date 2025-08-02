// src/infra/web/routes/article/moderate/approve-article.route.ts - WEBSOCKET VERSION
import { Controller, Patch, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApproveArticleUsecase } from '@/usecases/article/approve/approve-article.usecase';

//depois adicionar o guard de autenticação para moderador
@Controller('/moderation/articles')
export class ApproveArticleRoute {
  constructor(
    private readonly approveArticleUsecase: ApproveArticleUsecase,
  ) {}

  @Patch('/:id/approve')
  public async handle(
    @Param('id') articleId: string,
    @Req() req: Request,
  ) {
    const moderatorId = req['userId'];

    console.log(`👮 [ApproveArticleRoute] Moderator ${moderatorId} approving article ${articleId}`);

    const output = await this.approveArticleUsecase.execute({
      articleId,
      moderatorId,
    });

    console.log(`✅ [ApproveArticleRoute] Article approved. Real-time sent: ${output.realTimeNotificationSent}`);

    return {
      success: true,
      message: output.message,
      data: {
        id: output.id,
        titulo: output.titulo,
        status: output.status,
        approvedAt: output.approvedAt,
        realTimeNotification: output.realTimeNotificationSent,
      },
    };
  }
}
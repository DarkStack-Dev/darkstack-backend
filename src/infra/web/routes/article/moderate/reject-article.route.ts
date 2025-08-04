// src/infra/web/routes/article/moderate/reject-article.route.ts - WEBSOCKET VERSION
import { Controller, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { RejectArticleUsecase } from '@/usecases/article/reject/reject-article.usecase';

type RejectArticleRequest = {
  rejectionReason: string;
};

// depois adicionar o guard de autenticação para moderador
@Controller('/moderation/articles')
export class RejectArticleRoute {
  constructor(
    private readonly rejectArticleUsecase: RejectArticleUsecase,
  ) {}

  @Patch('/:id/reject')
  public async handle(
    @Param('id') articleId: string,
    @Body() body: RejectArticleRequest,
    @Req() req: Request,
  ) {
    const moderatorId = req['userId'];

    console.log(`👮 [RejectArticleRoute] Moderator ${moderatorId} rejecting article ${articleId}: ${body.rejectionReason}`);

    const output = await this.rejectArticleUsecase.execute({
      articleId,
      moderatorId,
      rejectionReason: body.rejectionReason,
    });

    console.log(`✅ [RejectArticleRoute] Article rejected. Real-time sent: ${output.realTimeNotificationSent}`);

    return {
      success: true,
      message: output.message,
      data: {
        id: output.id,
        titulo: output.titulo,
        status: output.status,
        rejectionReason: output.rejectionReason,
        realTimeNotification: output.realTimeNotificationSent,
      },
    };
  }
}
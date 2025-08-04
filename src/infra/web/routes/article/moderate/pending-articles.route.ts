// src/infra/web/routes/moderation/pending-articles.route.ts
import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { FindPendingArticlesUsecase } from '@/usecases/moderation/find-pending-articles/find-pending-articles.usecase';

type PendingArticlesQuery = {
  limit?: number;
  offset?: number;
};

@Controller('/moderation')
// TODO: Add guard for moderator authentication
export class PendingArticlesRoute {
  constructor(
    private readonly findPendingArticlesUsecase: FindPendingArticlesUsecase,
  ) {}

  @Get('/articles/pending')
  public async handle(
    @Query() query: PendingArticlesQuery,
    @Req() req: Request,
  ) {
    const moderatorId = req['userId'];

    const output = await this.findPendingArticlesUsecase.execute({
      moderatorId,
      limit: query.limit ? parseInt(query.limit.toString()) : 20,
      offset: query.offset ? parseInt(query.offset.toString()) : 0,
    });

    return {
      success: true,
      data: output,
    };
  }
}
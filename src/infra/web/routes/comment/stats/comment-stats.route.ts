// src/infra/web/routes/comment/stats/comment-stats.route.ts
import { Controller, Get, Query } from '@nestjs/common';
import { CommentStatsUsecase } from '@/usecases/comment/stats/comment-stats.usecase';
import { CommentStatsRequest, CommentStatsResponse } from './comment-stats.dto';
import { CommentStatsPresenter } from './comment-stats.presenter';
import { Roles } from '@/infra/web/auth/decorators/roles.decorator';

@Controller('/comments')
export class CommentStatsRoute {
  constructor(
    private readonly commentStatsUsecase: CommentStatsUsecase,
  ) {}

  @Get('/stats')
  @Roles('MODERATOR', 'ADMIN')
  public async handle(
    @Query() query: CommentStatsRequest,
  ): Promise<CommentStatsResponse> {
    const output = await this.commentStatsUsecase.execute({
      targetId: query.targetId,
      targetType: query.targetType,
    });

    return CommentStatsPresenter.toHttp(output);
  }
}
// src/infra/web/routes/comment/moderate/pending-moderation.route.ts
import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { FindPendingModerationUsecase } from '@/usecases/comment/moderate/find-pending-moderation.usecase';
import { FindPendingModerationRequest, FindPendingModerationResponse } from './find-pending-moderation.dto';
import { FindPendingModerationPresenter } from './find-pending-moderation.presenter';
import { Roles } from '@/infra/web/auth/decorators/roles.decorator';

@Controller('/comments')
export class FindPendingModerationRoute {
  constructor(
    private readonly findPendingModerationUsecase: FindPendingModerationUsecase,
  ) {}

  @Get('/pending-moderation')
  @Roles('MODERATOR', 'ADMIN')
  public async handle(
    @Query() query: FindPendingModerationRequest,
    @Req() req: Request,
  ): Promise<FindPendingModerationResponse> {
    const output = await this.findPendingModerationUsecase.execute({
      page: query.page,
      pageSize: query.pageSize,
      targetType: query.targetType,
    });

    return FindPendingModerationPresenter.toHttp(output);
  }
}
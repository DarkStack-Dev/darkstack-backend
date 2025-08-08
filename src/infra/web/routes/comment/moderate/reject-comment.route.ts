// src/infra/web/routes/comment/moderate/reject-comment.route.ts
import { Controller, Post, Param, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { RejectCommentUsecase } from '@/usecases/comment/moderate/reject-comment.usecase';
import { RejectCommentRequest, RejectCommentResponse } from './reject-comment.dto';
import { RejectCommentPresenter } from './reject-comment.presenter';
import { Roles } from '@/infra/web/auth/decorators/roles.decorator';

@Controller('/comments')
export class RejectCommentRoute {
  constructor(
    private readonly rejectCommentUsecase: RejectCommentUsecase,
  ) {}

  @Post('/:commentId/reject')
  @Roles('MODERATOR', 'ADMIN')
  public async handle(
    @Param('commentId') commentId: string,
    @Body() request: RejectCommentRequest,
    @Req() req: Request,
  ): Promise<RejectCommentResponse> {
    const moderatorId = req['userId'];

    const output = await this.rejectCommentUsecase.execute({
      commentId,
      moderatorId,
      reason: request.reason,
    });

    return RejectCommentPresenter.toHttp(output);
  }
}

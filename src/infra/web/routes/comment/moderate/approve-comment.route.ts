// src/infra/web/routes/comment/moderate/approve-comment.route.ts
import { Controller, Post, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApproveCommentUsecase } from '@/usecases/comment/moderate/approve-comment.usecase';
import { ApproveCommentResponse } from './approve-comment.dto';
import { ApproveCommentPresenter } from './approve-comment.presenter';
import { Roles } from '@/infra/web/auth/decorators/roles.decorator';

@Controller('/comments')
export class ApproveCommentRoute {
  constructor(
    private readonly approveCommentUsecase: ApproveCommentUsecase,
  ) {}

  @Post('/:commentId/approve')
  @Roles('MODERATOR', 'ADMIN')
  public async handle(
    @Param('commentId') commentId: string,
    @Req() req: Request,
  ): Promise<ApproveCommentResponse> {
    const moderatorId = req['userId'];

    const output = await this.approveCommentUsecase.execute({
      commentId,
      moderatorId,
    });

    return ApproveCommentPresenter.toHttp(output);
  }
}
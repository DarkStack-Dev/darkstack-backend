// src/infra/web/routes/comment/update/update-comment.route.ts
import { Controller, Put, Body, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { UpdateCommentUsecase } from '@/usecases/comment/update/update-comment.usecase';
import { UpdateCommentRequest, UpdateCommentResponse } from './update-comment.dto';
import { UpdateCommentPresenter } from './update-comment.presenter';
import { Roles } from '@/infra/web/auth/decorators/roles.decorator';

@Controller('/comments')
export class UpdateCommentRoute {
  constructor(
    private readonly updateCommentUsecase: UpdateCommentUsecase,
  ) {}

  @Put('/:commentId')
  @Roles('USER', 'MODERATOR', 'ADMIN')
  public async handle(
    @Param('commentId') commentId: string,
    @Body() request: UpdateCommentRequest,
    @Req() req: Request,
  ): Promise<UpdateCommentResponse> {
    const userId = req['userId'];

    const output = await this.updateCommentUsecase.execute({
      commentId,
      content: request.content,
      userId,
    });

    return UpdateCommentPresenter.toHttp(output);
  }
}
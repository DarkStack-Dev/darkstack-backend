
// src/infra/web/routes/comment/delete/delete-comment.route.ts
import { Controller, Delete, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { DeleteCommentUsecase } from '@/usecases/comment/delete/delete-comment.usecase';
import { DeleteCommentResponse } from './delete-comment.dto';
import { DeleteCommentPresenter } from './delete-comment.presenter';
import { Roles } from '@/infra/web/auth/decorators/roles.decorator';

@Controller('/comments')
export class DeleteCommentRoute {
  constructor(
    private readonly deleteCommentUsecase: DeleteCommentUsecase,
  ) {}

  @Delete('/:commentId')
  @Roles('USER', 'MODERATOR', 'ADMIN')
  public async handle(
    @Param('commentId') commentId: string,
    @Req() req: Request,
  ): Promise<DeleteCommentResponse> {
    const userId = req['userId'];

    const output = await this.deleteCommentUsecase.execute({
      commentId,
      userId,
    });

    return DeleteCommentPresenter.toHttp(output);
  }
}
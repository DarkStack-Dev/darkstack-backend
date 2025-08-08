// src/infra/web/routes/comment/create/create-comment.route.ts
import { Controller, Post, Body, Req, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { CreateCommentUsecase } from '@/usecases/comment/create/create-comment.usecase';
import { CreateCommentRequest, CreateCommentResponse } from './create-comment.dto';
import { CreateCommentPresenter } from './create-comment.presenter';
import { Roles } from '@/infra/web/auth/decorators/roles.decorator';

@Controller('/comments')
export class CreateCommentRoute {
  constructor(
    private readonly createCommentUsecase: CreateCommentUsecase,
  ) {}

  @Post()
  @Roles('USER', 'MODERATOR', 'ADMIN')
  public async handle(
    @Body() request: CreateCommentRequest,
    @Req() req: Request,
  ): Promise<CreateCommentResponse> {
    const userId = req['userId'];

    const output = await this.createCommentUsecase.execute({
      content: request.content,
      userId,
      targetId: request.targetId,
      targetType: request.targetType,
      parentId: request.parentId,
    });

    return CreateCommentPresenter.toHttp(output);
  }
}
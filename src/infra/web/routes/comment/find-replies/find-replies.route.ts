// src/infra/web/routes/comment/find-replies/find-replies.route.ts
import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { FindRepliesUsecase } from '@/usecases/comment/find-replies/find-replies.usecase';
import { FindRepliesRequest, FindRepliesResponse } from './find-replies.dto';
import { FindRepliesPresenter } from './find-replies.presenter';
import { IsPublic } from '@/infra/web/auth/decorators/is-public.decorator';

@Controller('/comments')
export class FindRepliesRoute {
  constructor(
    private readonly findRepliesUsecase: FindRepliesUsecase,
  ) {}

  @Get('/:commentId/replies')
  @IsPublic()
  public async handle(
    @Param('commentId') commentId: string,
    @Query() query: FindRepliesRequest,
    @Req() req: Request,
  ): Promise<FindRepliesResponse> {
    const currentUserId = req['userId'];

    const output = await this.findRepliesUsecase.execute({
      parentId: commentId,
      page: query.page,
      pageSize: query.pageSize,
      orderBy: query.orderBy,
      orderDirection: query.orderDirection,
      currentUserId,
    });

    return FindRepliesPresenter.toHttp(output);
  }
}

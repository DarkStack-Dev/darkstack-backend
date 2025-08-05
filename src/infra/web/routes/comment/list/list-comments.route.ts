// src/infra/web/routes/comment/list/list-comments.route.ts
import { Controller, Get, Query, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { ListCommentsUsecase } from '@/usecases/comment/list/list-comments.usecase';
import { ListCommentsRequest, ListCommentsResponse } from './list-comments.dto';
import { ListCommentsPresenter } from './list-comments.presenter';
import { IsPublic } from '@/infra/web/auth/decorators/is-public.decorator';

@Controller('/comments')
export class ListCommentsRoute {
  constructor(
    private readonly listCommentsUsecase: ListCommentsUsecase,
  ) {}

  @Get('/:targetType/:targetId')
  @IsPublic()
  public async handle(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
    @Query() query: ListCommentsRequest,
    @Req() req: Request,
  ): Promise<ListCommentsResponse> {
    const currentUserId = req['userId']; // Pode ser undefined se não autenticado

    const output = await this.listCommentsUsecase.execute({
      targetId,
      targetType: targetType.toUpperCase() as any,
      page: query.page,
      pageSize: query.pageSize,
      orderBy: query.orderBy,
      orderDirection: query.orderDirection,
      includeReplies: query.includeReplies,
      currentUserId,
    });

    return ListCommentsPresenter.toHttp(output);
  }
}
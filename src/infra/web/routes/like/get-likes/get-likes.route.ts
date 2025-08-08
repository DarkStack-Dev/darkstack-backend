// src/infra/web/routes/like/get-likes/get-likes.route.ts
import { Controller, Get, Query, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { GetLikesUsecase } from '@/usecases/like/get-likes/get-likes.usecase';
import { GetLikesRequest, GetLikesResponse } from './get-likes.dto';
import { GetLikesPresenter } from './get-likes.presenter';
import { IsPublic } from '@/infra/web/auth/decorators/is-public.decorator';

@Controller('/likes')
export class GetLikesRoute {
  constructor(
    private readonly getLikesUsecase: GetLikesUsecase,
  ) {}

  @Get('/:targetType/:targetId')
  @IsPublic()
  public async handle(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
    @Query() query: GetLikesRequest,
    @Req() req: Request,
  ): Promise<GetLikesResponse> {
    const output = await this.getLikesUsecase.execute({
      targetId,
      targetType: targetType.toUpperCase() as any,
      isLike: query.isLike,
      page: query.page,
      pageSize: query.pageSize,
      orderBy: query.orderBy,
      orderDirection: query.orderDirection,
    });

    return GetLikesPresenter.toHttp(output, targetId, targetType.toUpperCase() as any);
  }
}
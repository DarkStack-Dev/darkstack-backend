// src/infra/web/routes/like/get-counts/get-like-counts.route.ts
import { Controller, Get, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { GetLikeCountsUsecase } from '@/usecases/like/get-counts/get-like-counts.usecase';
import { GetLikeCountsResponse } from './get-like-counts.dto';
import { GetLikeCountsPresenter } from './get-like-counts.presenter';
import { IsPublic } from '@/infra/web/auth/decorators/is-public.decorator';

@Controller('/likes')
export class GetLikeCountsRoute {
  constructor(
    private readonly getLikeCountsUsecase: GetLikeCountsUsecase,
  ) {}

  @Get('/counts/:targetType/:targetId')
  @IsPublic()
  public async handle(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
    @Req() req: Request,
  ): Promise<GetLikeCountsResponse> {
    const currentUserId = req['userId']; // Pode ser undefined se não autenticado

    const output = await this.getLikeCountsUsecase.execute({
      targetId,
      targetType: targetType.toUpperCase() as any,
      currentUserId,
    });

    return GetLikeCountsPresenter.toHttp(output);
  }
}


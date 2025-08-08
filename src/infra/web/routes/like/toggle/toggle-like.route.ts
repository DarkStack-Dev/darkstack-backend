// src/infra/web/routes/like/toggle/toggle-like.route.ts
import { Controller, Post, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { ToggleLikeUsecase } from '@/usecases/like/toggle/toggle-like.usecase';
import { ToggleLikeRequest, ToggleLikeResponse } from './toggle-like.dto';
import { ToggleLikePresenter } from './toggle-like.presenter';
import { Roles } from '@/infra/web/auth/decorators/roles.decorator';

@Controller('/likes')
export class ToggleLikeRoute {
  constructor(
    private readonly toggleLikeUsecase: ToggleLikeUsecase,
  ) {}

  @Post('/toggle')
  @Roles('USER', 'MODERATOR', 'ADMIN')
  public async handle(
    @Body() request: ToggleLikeRequest,
    @Req() req: Request,
  ): Promise<ToggleLikeResponse> {
    const userId = req['userId'];

    const output = await this.toggleLikeUsecase.execute({
      userId,
      targetId: request.targetId,
      targetType: request.targetType,
      isLike: request.isLike,
    });

    return ToggleLikePresenter.toHttp(output);
  }
}

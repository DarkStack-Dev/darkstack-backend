// src/infra/web/routes/like/specific-actions/like.route.ts
import { Controller, Post, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { ToggleLikeUsecase } from '@/usecases/like/toggle/toggle-like.usecase';
import { ToggleLikeResponse } from '../toggle/toggle-like.dto';
import { ToggleLikePresenter } from '../toggle/toggle-like.presenter';
import { Roles } from '@/infra/web/auth/decorators/roles.decorator';

@Controller('/likes')
export class LikeRoute {
  constructor(
    private readonly toggleLikeUsecase: ToggleLikeUsecase,
  ) {}

  @Post('/:targetType/:targetId/like')
  @Roles('USER', 'MODERATOR', 'ADMIN')
  public async handleLike(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
    @Req() req: Request,
  ): Promise<ToggleLikeResponse> {
    const userId = req['userId'];

    const output = await this.toggleLikeUsecase.execute({
      userId,
      targetId,
      targetType: targetType.toUpperCase() as any,
      isLike: true,
    });

    return ToggleLikePresenter.toHttp(output);
  }

  @Post('/:targetType/:targetId/dislike')
  @Roles('USER', 'MODERATOR', 'ADMIN')
  public async handleDislike(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
    @Req() req: Request,
  ): Promise<ToggleLikeResponse> {
    const userId = req['userId'];

    const output = await this.toggleLikeUsecase.execute({
      userId,
      targetId,
      targetType: targetType.toUpperCase() as any,
      isLike: false,
    });

    return ToggleLikePresenter.toHttp(output);
  }
}

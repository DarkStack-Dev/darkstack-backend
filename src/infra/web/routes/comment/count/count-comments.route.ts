// src/infra/web/routes/comment/count/count-comments.route.ts
import { Controller, Get, Param } from '@nestjs/common';
import { CountCommentsUsecase } from '@/usecases/comment/count/count-comments.usecase';
import { CountCommentsResponse } from './count-comments.dto';
import { CountCommentsPresenter } from './count-comments.presenter';
import { IsPublic } from '@/infra/web/auth/decorators/is-public.decorator';

@Controller('/comments')
export class CountCommentsRoute {
  constructor(
    private readonly countCommentsUsecase: CountCommentsUsecase,
  ) {}

  @Get('/count/:targetType/:targetId')
  @IsPublic()
  public async handle(
    @Param('targetType') targetType: string,
    @Param('targetId') targetId: string,
  ): Promise<CountCommentsResponse> {
    const output = await this.countCommentsUsecase.execute({
      targetId,
      targetType: targetType.toUpperCase() as any,
    });

    return CountCommentsPresenter.toHttp(output);
  }
}
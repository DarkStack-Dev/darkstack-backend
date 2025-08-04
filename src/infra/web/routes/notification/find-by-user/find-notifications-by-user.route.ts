// src/infra/web/routes/notification/find-by-user/find-notifications-by-user.route.ts
import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { FindNotificationsByUserUsecase } from '@/usecases/notification/find-by-user/find-notifications-by-user.usecase';
import { FindNotificationsByUserRequest, FindNotificationsByUserResponse } from './find-notifications-by-user.dto';
import { FindNotificationsByUserPresenter } from './find-notifications-by-user.presenter';

@Controller('/notifications')
export class FindNotificationsByUserRoute {
  constructor(
    private readonly findNotificationsByUserUsecase: FindNotificationsByUserUsecase,
  ) {}

  @Get()
  public async handle(
    @Query() query: FindNotificationsByUserRequest,
    @Req() req: Request,
  ): Promise<FindNotificationsByUserResponse> {
    const userId = req['userId'];

    const output = await this.findNotificationsByUserUsecase.execute({
      userId,
      isRead: query.isRead,
      limit: query.limit ? parseInt(query.limit.toString()) : undefined,
      offset: query.offset ? parseInt(query.offset.toString()) : undefined,
    });

    return FindNotificationsByUserPresenter.toHttp(output);
  }
}
// src/infra/web/routes/notification/get-unread-count/get-unread-count.route.ts
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { GetUnreadNotificationsCountUsecase } from '@/usecases/notification/get-unread-count/get-unread-notifications-count.usecase';

@Controller('/notifications')
export class GetUnreadNotificationsCountRoute {
  constructor(
    private readonly getUnreadCountUsecase: GetUnreadNotificationsCountUsecase,
  ) {}

  @Get('/unread-count')
  public async handle(@Req() req: Request) {
    const userId = req['userId'];

    const output = await this.getUnreadCountUsecase.execute({ userId });

    return {
      success: true,
      data: output,
    };
  }
}
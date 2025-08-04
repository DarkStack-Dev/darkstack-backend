// src/infra/web/routes/notification/mark-all-read/mark-all-read.route.ts
import { Controller, Patch, Req } from '@nestjs/common';
import { Request } from 'express';
import { MarkAllNotificationsAsReadUsecase } from '@/usecases/notification/mark-all-read/mark-all-notifications-as-read.usecase';

@Controller('/notifications')
export class MarkAllNotificationsAsReadRoute {
  constructor(
    private readonly markAllAsReadUsecase: MarkAllNotificationsAsReadUsecase,
  ) {}

  @Patch('/mark-all-read')
  public async handle(@Req() req: Request) {
    const userId = req['userId'];

    const output = await this.markAllAsReadUsecase.execute({ userId });

    return {
      success: true,
      message: 'Todas as notificações foram marcadas como lidas',
      data: output,
    };
  }
}
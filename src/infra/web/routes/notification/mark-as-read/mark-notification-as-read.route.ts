// src/infra/web/routes/notification/mark-as-read/mark-notification-as-read.route.ts - WEBSOCKET VERSION
import { Controller, Patch, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { MarkNotificationAsReadUsecase } from '@/usecases/notification/mark-as-read/mark-notification-as-read.usecase';

@Controller('/notifications')
export class MarkNotificationAsReadRoute {
  constructor(
    private readonly markAsReadUsecase: MarkNotificationAsReadUsecase,
  ) {}

  @Patch('/:id/read')
  public async handle(
    @Param('id') notificationId: string,
    @Req() req: Request,
  ) {
    const userId = req['userId'];

    const output = await this.markAsReadUsecase.execute({
      notificationId,
      userId,
    });

    return {
      success: true,
      message: 'Notificação marcada como lida',
      data: output,
    };
  }
}

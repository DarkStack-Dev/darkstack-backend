// src/infra/web/routes/notification/stream/notification-stream.route.ts
import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { NotificationStreamService } from '@/infra/services/notification/notification-stream.service';

@Controller('/notifications')
export class NotificationStreamRoute {
  constructor(
    private readonly notificationStreamService: NotificationStreamService,
  ) {}

  @Get('/stream')
  public stream(@Req() req: Request, @Res() res: Response): void {
    const userId = req['userId'];

    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado' });
      return;
    }

    // Adicionar cliente ao stream de notificações
    this.notificationStreamService.addClient(userId, res);
  }

  @Get('/stream/status')
  public getStreamStatus() {
    return {
      success: true,
      data: this.notificationStreamService.getConnectionStatus(),
    };
  }
}
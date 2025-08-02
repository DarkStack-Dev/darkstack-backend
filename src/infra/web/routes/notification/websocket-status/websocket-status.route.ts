// src/infra/web/routes/notification/websocket-status/websocket-status.route.ts
import { Controller, Get } from '@nestjs/common';
import { NotificationGateway } from '@/infra/websocket/notification.gateway';

@Controller('/notifications')
export class WebSocketStatusRoute {
  constructor(
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @Get('/websocket/status')
  public getWebSocketStatus() {
    const status = this.notificationGateway.getConnectionStatus();
    
    return {
      success: true,
      data: {
        ...status,
        isHealthy: status.totalConnections > 0,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('/websocket/health')
  public getWebSocketHealth() {
    const status = this.notificationGateway.getConnectionStatus();
    
    return {
      success: true,
      data: {
        status: 'healthy',
        connectedUsers: status.totalUsers,
        totalConnections: status.totalConnections,
        moderatorsOnline: status.moderatorsConnected,
      },
    };
  }
}
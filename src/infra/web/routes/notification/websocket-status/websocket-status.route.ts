// src/infra/web/routes/notification/websocket-status/websocket-status.route.ts
import { Controller, Get, HttpStatus } from '@nestjs/common';
import { NotificationGateway } from '@/infra/websocket/notification.gateway';

@Controller('notifications/websocket')
export class WebSocketStatusRoute {
  constructor(
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @Get('status')
  async getStatus() {
    const status = this.notificationGateway.getConnectionStatus();
    
    return {
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      data: {
        ...status,
        endpoints: {
          websocket: 'ws://localhost:3001/notifications',
          testPage: 'http://localhost:3001/test-websocket.html',
        },
        instructions: {
          connect: 'Use Socket.IO client com auth.token = JWT_TOKEN',
          events: {
            outgoing: ['ping', 'joinRoom', 'watchEntity', 'unwatchEntity'],
            incoming: ['connected', 'pong', 'newNotification', 'newModerationRequest', 'newComment', 'commentUpdated', 'commentDeleted'],
          },
        },
      },
      message: status.serverReady 
        ? `WebSocket funcionando! ${status.totalConnections} conexões ativas`
        : 'WebSocket não está pronto ainda',
    };
  }

  @Get('test')
  async getTestInfo() {
    return {
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString(),
      data: {
        testPage: {
          url: 'http://localhost:3001/test-websocket.html',
          description: 'Página HTML completa para testar WebSocket',
        },
        steps: [
          '1. Obtenha um JWT token fazendo login via API',
          '2. Abra a página de teste no navegador',
          '3. Cole o token no campo JWT Token',
          '4. Clique em "Conectar WebSocket"',
          '5. Use os botões de teste para verificar funcionalidades',
          '6. Crie um artigo para testar notificações de moderação',
        ],
        endpoints: {
          login: 'POST http://localhost:3001/user/login',
          createArticle: 'POST http://localhost:3001/articles',
          websocketStatus: 'GET http://localhost:3001/notifications/websocket/status',
        },
        exampleLogin: {
          method: 'POST',
          url: 'http://localhost:3001/user/login',
          body: {
            email: 'seu-email@exemplo.com',
            password: 'sua-senha',
          },
        },
        postmanAlternative: {
          note: 'Postman tem suporte limitado para WebSocket.',
          recommendation: 'Use a página HTML de teste fornecida ou um cliente Socket.IO dedicado.',
        },
      },
    };
  }
}
// src/infra/websocket/notification.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRoles?: string[];
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  namespace: '/notifications'
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);
  private connectedUsers = new Map<string, AuthenticatedSocket[]>();

  constructor(
    private readonly userRepository: UserGatewayRepository,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extrair token do handshake
      const token = this.extractToken(client);
      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      // Verificar e decodificar token
      const payload = this.jwtService.verify(token);
      const userId = payload.sub || payload.userId;

      if (!userId) {
        this.logger.warn(`Client ${client.id} connected with invalid token`);
        client.disconnect();
        return;
      }

      // Verificar se usuário existe
      const user = await this.userRepository.findById(userId);
      if (!user || !user.getIsActivate()) {
        this.logger.warn(`Client ${client.id} connected with non-existent or inactive user ${userId}`);
        client.disconnect();
        return;
      }

      // Adicionar informações do usuário ao socket
      client.userId = userId;
      client.userRoles = user.getRoles();

      // Adicionar à lista de usuários conectados
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, []);
      }
      this.connectedUsers.get(userId)!.push(client);

      // Juntar em room do usuário
      client.join(`user_${userId}`);

      // Se for moderador, juntar em room de moderadores
      if (user.isModerator() || user.isAdmin()) {
        client.join('moderators');
      }

      this.logger.log(`User ${userId} connected (${client.id}). Active connections: ${this.getTotalConnections()}`);

      // Enviar confirmação de conexão
      client.emit('connected', {
        message: 'Conectado ao sistema de notificações em tempo real',
        userId: userId,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error(`Connection error for client ${client.id}:`, error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      const userConnections = this.connectedUsers.get(client.userId);
      if (userConnections) {
        const filteredConnections = userConnections.filter(socket => socket.id !== client.id);
        
        if (filteredConnections.length === 0) {
          this.connectedUsers.delete(client.userId);
        } else {
          this.connectedUsers.set(client.userId, filteredConnections);
        }
      }

      this.logger.log(`User ${client.userId} disconnected (${client.id}). Active connections: ${this.getTotalConnections()}`);
    } else {
      this.logger.log(`Anonymous client ${client.id} disconnected`);
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  @SubscribeMessage('markAsRead')
  handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { notificationId: string }
  ) {
    // Emitir confirmação (o use case real será chamado via HTTP)
    client.emit('notificationMarkedAsRead', {
      notificationId: data.notificationId,
      timestamp: new Date().toISOString(),
    });
  }

  // Métodos para envio de notificações

  sendNotificationToUser(userId: string, notification: any): boolean {
    const userSockets = this.connectedUsers.get(userId);
    if (!userSockets || userSockets.length === 0) {
      this.logger.debug(`No active connections for user ${userId}`);
      return false;
    }

    const notificationData = {
      type: 'notification',
      data: notification,
      timestamp: new Date().toISOString(),
    };

    let sentCount = 0;
    userSockets.forEach(socket => {
      try {
        socket.emit('newNotification', notificationData);
        sentCount++;
      } catch (error) {
        this.logger.error(`Error sending notification to socket ${socket.id}:`, error);
      }
    });

    this.logger.log(`Sent notification to user ${userId} (${sentCount}/${userSockets.length} connections)`);
    return sentCount > 0;
  }

  sendNotificationToModerators(notification: any): boolean {
    const notificationData = {
      type: 'moderation',
      data: notification,
      timestamp: new Date().toISOString(),
    };

    this.server.to('moderators').emit('newModerationRequest', notificationData);
    
    const moderatorCount = this.getModeratorsConnectedCount();
    this.logger.log(`Sent moderation notification to ${moderatorCount} connected moderators`);
    
    return moderatorCount > 0;
  }

  // Método para broadcast geral (raramente usado)
  broadcastToAll(message: any) {
    this.server.emit('broadcast', {
      type: 'broadcast',
      data: message,
      timestamp: new Date().toISOString(),
    });
  }

  // Métodos utilitários

  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId) && this.connectedUsers.get(userId)!.length > 0;
  }

  getUserConnectionCount(userId: string): number {
    return this.connectedUsers.get(userId)?.length || 0;
  }

  getTotalConnections(): number {
    let total = 0;
    this.connectedUsers.forEach(connections => {
      total += connections.length;
    });
    return total;
  }

  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  getModeratorsConnectedCount(): number {
    return this.server.sockets.adapter.rooms.get('moderators')?.size || 0;
  }

  // Status para debugging
  getConnectionStatus() {
    const status: any = {
      totalUsers: this.connectedUsers.size,
      totalConnections: this.getTotalConnections(),
      moderatorsConnected: this.getModeratorsConnectedCount(),
      users: {},
    };

    this.connectedUsers.forEach((connections, userId) => {
      status.users[userId] = {
        connectionCount: connections.length,
        socketIds: connections.map(socket => socket.id),
        roles: connections[0]?.userRoles || [],
      };
    });

    return status;
  }

  private extractToken(client: Socket): string | null {
    // Tentar extrair token de diferentes locais
    const token = 
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '') ||
      client.handshake.query?.token;

    return typeof token === 'string' ? token : null;
  }
}
// src/infra/websocket/notification.gateway.ts - CORRIGIDO COM WEBSOCKET PARA COMENTÁRIOS
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
import { JwtService } from '@/infra/services/jwt/jwt.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRoles?: string[];
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
    credentials: true,
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

      // Verificar e decodificar token usando o serviço customizado
      const payload = this.jwtService.verifyAuthToken(token);
      const userId = payload.userId;

      if (!userId) {
        this.logger.warn(`Client ${client.id} connected with invalid token`);
        client.disconnect();
        return;
      }

      // Verificar se usuário existe e está ativo
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

      // Se for moderador/admin, juntar em room de moderadores
      if (user.isModerator() || user.isAdmin()) {
        client.join('moderators');
        this.logger.log(`Moderator ${user.getName()} joined moderators room`);
      }

      this.logger.log(`User ${user.getName()} (${userId}) connected via WebSocket. Total connections: ${this.getTotalConnections()}`);

      // Enviar confirmação de conexão
      client.emit('connected', {
        message: 'Conectado ao sistema de notificações em tempo real',
        userId: userId,
        userRoles: user.getRoles(),
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error(`Connection error for client ${client.id}:`, error);
      client.emit('error', {
        message: 'Erro de autenticação',
        timestamp: new Date().toISOString(),
      });
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
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string }
  ) {
    client.join(data.room);
    client.emit('joinedRoom', { room: data.room, timestamp: new Date().toISOString() });
  }

  // ✅ MÉTODOS PARA NOTIFICAÇÕES (CORRIGIDOS)

  /**
   * Envia notificação para um usuário específico
   */
  sendNotificationToUser(userId: string, notification: any): boolean {
    const userSockets = this.connectedUsers.get(userId);
    if (!userSockets || userSockets.length === 0) {
      this.logger.debug(`No active WebSocket connections for user ${userId}`);
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
        if (!socket.disconnected) {
          socket.emit('newNotification', notificationData);
          sentCount++;
        }
      } catch (error) {
        this.logger.error(`Error sending notification to socket ${socket.id}:`, error);
      }
    });

    this.logger.log(`Sent notification to user ${userId} (${sentCount}/${userSockets.length} connections)`);
    return sentCount > 0;
  }

  /**
   * ✅ NOVO: Método notifyUser para compatibilidade
   */
  notifyUser(userId: string, notification: any): boolean {
    return this.sendNotificationToUser(userId, notification);
  }

  /**
   * Envia notificação para todos os moderadores conectados
   */
  sendNotificationToModerators(notification: any): number {
    const notificationData = {
      type: 'moderation',
      data: notification,
      timestamp: new Date().toISOString(),
    };

    const moderatorsRoom = this.server.sockets.adapter.rooms.get('moderators');
    const moderatorCount = moderatorsRoom?.size || 0;

    if (moderatorCount > 0) {
      this.server.to('moderators').emit('newModerationRequest', notificationData);
      this.logger.log(`Sent moderation notification to ${moderatorCount} connected moderators`);
    } else {
      this.logger.debug('No moderators connected via WebSocket');
    }

    return moderatorCount;
  }

  /**
   * ✅ NOVO: Método notifyModerators para compatibilidade
   */
  notifyModerators(notification: any): number {
    return this.sendNotificationToModerators(notification);
  }

  // ✅ NOVOS MÉTODOS PARA COMENTÁRIOS EM TEMPO REAL

  /**
   * Broadcast novo comentário para usuários visualizando a entidade
   */
  broadcastNewComment(targetType: string, targetId: string, commentData: any): number {
    const roomName = `${targetType.toLowerCase()}_${targetId}`;
    const room = this.server.sockets.adapter.rooms.get(roomName);
    const userCount = room?.size || 0;

    if (userCount > 0) {
      this.server.to(roomName).emit('newComment', {
        type: 'NEW_COMMENT',
        data: commentData,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`Broadcast new comment to ${userCount} users viewing ${targetType} ${targetId}`);
    }

    return userCount;
  }

  /**
   * Broadcast comentário editado
   */
  broadcastCommentUpdate(commentData: any): number {
    const updateData = {
      type: 'COMMENT_UPDATED',
      data: commentData,
      timestamp: new Date().toISOString(),
    };

    // Broadcast para todos os usuários conectados
    this.server.emit('commentUpdated', updateData);
    
    const totalConnections = this.getTotalConnections();
    this.logger.log(`Broadcast comment update to ${totalConnections} connections`);
    
    return totalConnections;
  }

  /**
   * Broadcast comentário deletado
   */
  broadcastCommentDelete(commentId: string): number {
    const deleteData = {
      type: 'COMMENT_DELETED',
      data: { commentId },
      timestamp: new Date().toISOString(),
    };

    // Broadcast para todos os usuários conectados
    this.server.emit('commentDeleted', deleteData);
    
    const totalConnections = this.getTotalConnections();
    this.logger.log(`Broadcast comment delete to ${totalConnections} connections`);
    
    return totalConnections;
  }

  /**
   * Permitir usuários entrarem em rooms de entidades específicas
   */
  @SubscribeMessage('watchEntity')
  handleWatchEntity(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { targetType: string; targetId: string }
  ) {
    const roomName = `${data.targetType.toLowerCase()}_${data.targetId}`;
    client.join(roomName);
    
    client.emit('watchingEntity', { 
      room: roomName, 
      targetType: data.targetType,
      targetId: data.targetId,
      timestamp: new Date().toISOString() 
    });

    this.logger.log(`User ${client.userId} joined room ${roomName}`);
  }

  /**
   * Permitir usuários saírem de rooms de entidades específicas
   */
  @SubscribeMessage('unwatchEntity')
  handleUnwatchEntity(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { targetType: string; targetId: string }
  ) {
    const roomName = `${data.targetType.toLowerCase()}_${data.targetId}`;
    client.leave(roomName);
    
    client.emit('unwatchingEntity', { 
      room: roomName, 
      targetType: data.targetType,
      targetId: data.targetId,
      timestamp: new Date().toISOString() 
    });

    this.logger.log(`User ${client.userId} left room ${roomName}`);
  }

  /**
   * Envia broadcast para todos os usuários conectados
   */
  broadcastToAll(message: any): number {
    const totalConnections = this.getTotalConnections();
    
    this.server.emit('broadcast', {
      type: 'broadcast',
      data: message,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Broadcast sent to ${totalConnections} connections`);
    return totalConnections;
  }

  // ✅ MÉTODOS UTILITÁRIOS

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

  // Status para debugging e monitoramento
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
      client.handshake.query?.token as string;

    return typeof token === 'string' ? token : null;
  }
}
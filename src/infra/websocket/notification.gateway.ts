// src/infra/websocket/notification.gateway.ts - CORRIGIDO COM VERIFICAÇÕES
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  OnGatewayInit,
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
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);
  private connectedUsers = new Map<string, AuthenticatedSocket[]>();
  private isServerReady = false; // ✅ NOVO: Flag para verificar se servidor está pronto

  constructor(
    private readonly userRepository: UserGatewayRepository,
    private readonly jwtService: JwtService,
  ) {}

  // ✅ NOVO: Implementar OnGatewayInit
  afterInit(server: Server) {
    this.isServerReady = true;
    this.logger.log('🚀 WebSocket Server initialized successfully');
    this.logger.log(`🔌 WebSocket available at: ws://localhost:3001/notifications`);
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Verificar se server está pronto
      if (!this.isServerReady) {
        this.logger.warn(`Client ${client.id} trying to connect before server is ready`);
        client.disconnect();
        return;
      }

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
        this.logger.log(`🛡️ Moderator ${user.getName()} joined moderators room`);
      }

      this.logger.log(`✅ User ${user.getName()} (${userId}) connected via WebSocket. Total connections: ${this.getTotalConnections()}`);

      // Enviar confirmação de conexão
      client.emit('connected', {
        message: 'Conectado ao sistema de notificações em tempo real',
        userId: userId,
        userRoles: user.getRoles(),
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error(`❌ Connection error for client ${client.id}:`, error);
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

      this.logger.log(`👋 User ${client.userId} disconnected (${client.id}). Active connections: ${this.getTotalConnections()}`);
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

  // ✅ MÉTODOS PARA NOTIFICAÇÕES (COM VERIFICAÇÕES DE SEGURANÇA)

  /**
   * Envia notificação para um usuário específico
   */
  sendNotificationToUser(userId: string, notification: any): boolean {
    // ✅ Verificação de segurança
    if (!this.isServerReady || !this.server) {
      this.logger.warn('WebSocket server not ready, cannot send notification to user');
      return false;
    }

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

    this.logger.log(`📤 Sent notification to user ${userId} (${sentCount}/${userSockets.length} connections)`);
    return sentCount > 0;
  }

  /**
   * ✅ CORRIGIDO: Envia notificação para todos os moderadores conectados
   */
  sendNotificationToModerators(notification: any): number {
    // ✅ Verificações de segurança
    if (!this.isServerReady || !this.server || !this.server.sockets || !this.server.sockets.adapter) {
      this.logger.warn('WebSocket server not ready, cannot send notification to moderators');
      return 0;
    }

    const notificationData = {
      type: 'moderation',
      data: notification,
      timestamp: new Date().toISOString(),
    };

    try {
      const moderatorsRoom = this.server.sockets.adapter.rooms.get('moderators');
      const moderatorCount = moderatorsRoom?.size || 0;

      if (moderatorCount > 0) {
        this.server.to('moderators').emit('newModerationRequest', notificationData);
        this.logger.log(`🛡️ Sent moderation notification to ${moderatorCount} connected moderators`);
      } else {
        this.logger.debug('No moderators connected via WebSocket');
      }

      return moderatorCount;
    } catch (error) {
      this.logger.error('❌ Error sending notification to moderators:', error);
      return 0;
    }
  }

  /**
   * ✅ Método notifyUser para compatibilidade
   */
  notifyUser(userId: string, notification: any): boolean {
    return this.sendNotificationToUser(userId, notification);
  }

  /**
   * ✅ Método notifyModerators para compatibilidade
   */
  notifyModerators(notification: any): number {
    return this.sendNotificationToModerators(notification);
  }

  // ✅ MÉTODOS PARA COMENTÁRIOS EM TEMPO REAL

  /**
   * Broadcast novo comentário para usuários visualizando a entidade
   */
  broadcastNewComment(targetType: string, targetId: string, commentData: any): number {
    if (!this.isServerReady || !this.server) {
      this.logger.warn('WebSocket server not ready, cannot broadcast comment');
      return 0;
    }

    try {
      const roomName = `${targetType.toLowerCase()}_${targetId}`;
      const room = this.server.sockets.adapter.rooms.get(roomName);
      const userCount = room?.size || 0;

      if (userCount > 0) {
        this.server.to(roomName).emit('newComment', {
          type: 'NEW_COMMENT',
          data: commentData,
          timestamp: new Date().toISOString(),
        });

        this.logger.log(`💬 Broadcast new comment to ${userCount} users viewing ${targetType} ${targetId}`);
      }

      return userCount;
    } catch (error) {
      this.logger.error('❌ Error broadcasting new comment:', error);
      return 0;
    }
  }

  /**
   * Broadcast comentário editado
   */
  broadcastCommentUpdate(commentData: any): number {
    if (!this.isServerReady || !this.server) {
      this.logger.warn('WebSocket server not ready, cannot broadcast comment update');
      return 0;
    }

    try {
      const updateData = {
        type: 'COMMENT_UPDATED',
        data: commentData,
        timestamp: new Date().toISOString(),
      };

      this.server.emit('commentUpdated', updateData);
      
      const totalConnections = this.getTotalConnections();
      this.logger.log(`✏️ Broadcast comment update to ${totalConnections} connections`);
      
      return totalConnections;
    } catch (error) {
      this.logger.error('❌ Error broadcasting comment update:', error);
      return 0;
    }
  }

  /**
   * Broadcast comentário deletado
   */
  broadcastCommentDelete(commentId: string): number {
    if (!this.isServerReady || !this.server) {
      this.logger.warn('WebSocket server not ready, cannot broadcast comment delete');
      return 0;
    }

    try {
      const deleteData = {
        type: 'COMMENT_DELETED',
        data: { commentId },
        timestamp: new Date().toISOString(),
      };

      this.server.emit('commentDeleted', deleteData);
      
      const totalConnections = this.getTotalConnections();
      this.logger.log(`🗑️ Broadcast comment delete to ${totalConnections} connections`);
      
      return totalConnections;
    } catch (error) {
      this.logger.error('❌ Error broadcasting comment delete:', error);
      return 0;
    }
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

    this.logger.log(`👀 User ${client.userId} joined room ${roomName}`);
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

    this.logger.log(`👋 User ${client.userId} left room ${roomName}`);
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
    if (!this.isServerReady || !this.server || !this.server.sockets || !this.server.sockets.adapter) {
      return 0;
    }
    
    try {
      return this.server.sockets.adapter.rooms.get('moderators')?.size || 0;
    } catch (error) {
      this.logger.error('Error getting moderators count:', error);
      return 0;
    }
  }

  // ✅ Status para debugging e monitoramento
  getConnectionStatus() {
    const status: any = {
      serverReady: this.isServerReady,
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
// src/infra/websocket/notification.gateway.ts - CORRIGIDO
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
    origin: "*",
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
  private isServerReady = false;

  constructor(
    private readonly userRepository: UserGatewayRepository,
    private readonly jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    this.isServerReady = true;
    this.logger.log('🚀 WebSocket Server initialized successfully');
    this.logger.log(`🔌 WebSocket available at: ws://localhost:3001/notifications`);
    
    // ✅ NOVO: Log adicional para debug
    this.logger.log(`📊 Server details - Ready: ${this.isServerReady}, Server: ${!!this.server}, Sockets: ${!!this.server?.sockets}`);
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      if (!this.isServerReady) {
        this.logger.warn(`Client ${client.id} trying to connect before server is ready`);
        client.disconnect();
        return;
      }

      const token = this.extractToken(client);
      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verifyAuthToken(token);
      const userId = payload.userId;

      if (!userId) {
        this.logger.warn(`Client ${client.id} connected with invalid token`);
        client.disconnect();
        return;
      }

      const user = await this.userRepository.findById(userId);
      if (!user || !user.getIsActivate()) {
        this.logger.warn(`Client ${client.id} connected with non-existent or inactive user ${userId}`);
        client.disconnect();
        return;
      }

      client.userId = userId;
      client.userRoles = user.getRoles();

      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, []);
      }
      this.connectedUsers.get(userId)!.push(client);

      client.join(`user_${userId}`);

      // ✅ MELHORADO: Log mais detalhado para moderadores
      if (user.isModerator() || user.isAdmin()) {
        client.join('moderators');
        this.logger.log(`🛡️ Moderator ${user.getName()} (${userId}) joined moderators room. Roles: ${user.getRoles().join(', ')}`);
      } else {
        this.logger.log(`👤 Regular user ${user.getName()} (${userId}) connected. Roles: ${user.getRoles().join(', ')}`);
      }

      this.logger.log(`✅ User ${user.getName()} (${userId}) connected via WebSocket. Total connections: ${this.getTotalConnections()}`);

      client.emit('connected', {
        message: 'Conectado ao sistema de notificações em tempo real',
        userId: userId,
        userRoles: user.getRoles(),
        isModerator: user.isModerator() || user.isAdmin(),
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

  /**
   * ✅ CORRIGIDO: Método principal para notificar moderadores
   */
  sendNotificationToModerators(notification: any): number {
    // ✅ Verificação simplificada e mais robusta
    if (!this.isServerReady) {
      this.logger.warn('WebSocket server not ready (isServerReady = false)');
      return 0;
    }

    if (!this.server) {
      this.logger.warn('WebSocket server instance not available');
      return 0;
    }

    // ✅ NOVO: Debug detalhado
    this.logger.debug(`🔍 Sending notification to moderators - Server ready: ${this.isServerReady}`);
    this.logger.debug(`🔍 Server object: ${!!this.server}, Sockets: ${!!this.server.sockets}`);
    
    const notificationData = {
      type: 'moderation',
      data: notification,
      timestamp: new Date().toISOString(),
    };

    try {
      // ✅ Verificação mais robusta da room de moderadores
      let moderatorCount = 0;
      
      if (this.server.sockets && this.server.sockets.adapter && this.server.sockets.adapter.rooms) {
        const moderatorsRoom = this.server.sockets.adapter.rooms.get('moderators');
        moderatorCount = moderatorsRoom?.size || 0;
        
        this.logger.debug(`🔍 Moderators room found: ${!!moderatorsRoom}, Size: ${moderatorCount}`);
      } else {
        this.logger.warn('⚠️ Server adapter or rooms not available, trying alternative approach');
        
        // ✅ ALTERNATIVA: Contar moderadores conectados manualmente
        moderatorCount = this.getConnectedModeratorsCount();
      }

      if (moderatorCount > 0) {
        this.server.to('moderators').emit('newModerationRequest', notificationData);
        this.logger.log(`🛡️ ✅ Sent moderation notification to ${moderatorCount} connected moderators`);
      } else {
        this.logger.warn('⚠️ No moderators connected via WebSocket');
        
        // ✅ NOVO: Log de usuários conectados para debug
        this.logConnectedUsers();
      }

      return moderatorCount;
    } catch (error) {
      this.logger.error('❌ Error sending notification to moderators:', error);
      return 0;
    }
  }

  /**
   * ✅ NOVO: Método alternativo para contar moderadores conectados
   */
  private getConnectedModeratorsCount(): number {
    let count = 0;
    this.connectedUsers.forEach((connections) => {
      connections.forEach((socket) => {
        if (socket.userRoles?.includes('MODERATOR') || socket.userRoles?.includes('ADMIN')) {
          count++;
        }
      });
    });
    return count;
  }

  /**
   * ✅ NOVO: Log detalhado de usuários conectados para debug
   */
  private logConnectedUsers(): void {
    this.logger.debug(`📊 Connected users summary:`);
    this.logger.debug(`   Total users: ${this.connectedUsers.size}`);
    this.logger.debug(`   Total connections: ${this.getTotalConnections()}`);
    
    let moderatorCount = 0;
    this.connectedUsers.forEach((connections, userId) => {
      const firstSocket = connections[0];
      const roles = firstSocket?.userRoles || [];
      const isModerator = roles.includes('MODERATOR') || roles.includes('ADMIN');
      
      if (isModerator) moderatorCount++;
      
      this.logger.debug(`   User ${userId}: ${connections.length} connections, Roles: [${roles.join(', ')}], IsModerator: ${isModerator}`);
    });
    
    this.logger.debug(`   Moderators connected: ${moderatorCount}`);
  }

  sendNotificationToUser(userId: string, notification: any): boolean {
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

  // ✅ Métodos de compatibilidade
  notifyUser(userId: string, notification: any): boolean {
    return this.sendNotificationToUser(userId, notification);
  }

  notifyModerators(notification: any): number {
    return this.sendNotificationToModerators(notification);
  }

  // ✅ NOVO: Endpoint para debug via WebSocket
  @SubscribeMessage('getServerStatus')
  handleGetServerStatus(@ConnectedSocket() client: AuthenticatedSocket) {
    const status = this.getConnectionStatus();
    client.emit('serverStatus', status);
  }

  // Resto dos métodos permanecem iguais...
  broadcastNewComment(targetType: string, targetId: string, commentData: any): number {
    if (!this.isServerReady || !this.server) {
      this.logger.warn('WebSocket server not ready, cannot broadcast comment');
      return 0;
    }

    try {
      const roomName = `${targetType.toLowerCase()}_${targetId}`;
      const room = this.server.sockets.adapter?.rooms?.get(roomName);
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

  // Métodos utilitários
  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId) && this.connectedUsers.get(userId)!.length > 0;
  }

  getTotalConnections(): number {
    let total = 0;
    this.connectedUsers.forEach(connections => {
      total += connections.length;
    });
    return total;
  }

  getModeratorsConnectedCount(): number {
    if (!this.isServerReady || !this.server?.sockets?.adapter?.rooms) {
      return this.getConnectedModeratorsCount(); // Fallback
    }
    
    try {
      return this.server.sockets.adapter.rooms.get('moderators')?.size || 0;
    } catch (error) {
      this.logger.error('Error getting moderators count:', error);
      return this.getConnectedModeratorsCount(); // Fallback
    }
  }

  getConnectionStatus() {
    const status: any = {
      serverReady: this.isServerReady,
      serverAvailable: !!this.server,
      socketsAvailable: !!this.server?.sockets,
      adapterAvailable: !!this.server?.sockets?.adapter,
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
        isModerator: connections[0]?.userRoles?.includes('MODERATOR') || connections[0]?.userRoles?.includes('ADMIN') || false,
      };
    });

    return status;
  }

  private extractToken(client: Socket): string | null {
    const token = 
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '') ||
      client.handshake.query?.token as string;

    return typeof token === 'string' ? token : null;
  }

  // ✅ NOVOS MÉTODOS PARA COMENTÁRIOS
  // broadcastNewComment(targetType: string, targetId: string, commentData: any): number {
  //   if (!this.isServerReady || !this.server) {
  //     this.logger.warn('WebSocket server not ready, cannot broadcast comment');
  //     return 0;
  //   }

  //   try {
  //     const roomName = `${targetType.toLowerCase()}_${targetId}`;
  //     const room = this.server.sockets.adapter?.rooms?.get(roomName);
  //     const userCount = room?.size || 0;

  //     if (userCount > 0) {
  //       this.server.to(roomName).emit('newComment', {
  //         type: 'NEW_COMMENT',
  //         data: commentData,
  //         timestamp: new Date().toISOString(),
  //       });

  //       this.logger.log(`💬 Broadcast new comment to ${userCount} users viewing ${targetType} ${targetId}`);
  //     }

  //     return userCount;
  //   } catch (error) {
  //     this.logger.error('❌ Error broadcasting new comment:', error);
  //     return 0;
  //   }
  // }

  /**
   * ✅ NOVO: Broadcast quando comentário é atualizado
   */
  broadcastCommentUpdate(updateData: any): number {
    if (!this.isServerReady || !this.server) {
      this.logger.warn('WebSocket server not ready, cannot broadcast comment update');
      return 0;
    }

    try {
      // Broadcast para todos os usuários conectados
      const totalConnections = this.getTotalConnections();
      
      if (totalConnections > 0) {
        this.server.emit('commentUpdated', {
          type: 'COMMENT_UPDATED',
          data: updateData,
          timestamp: new Date().toISOString(),
        });

        this.logger.log(`🔄 Broadcast comment update to ${totalConnections} connected users`);
      }

      return totalConnections;
    } catch (error) {
      this.logger.error('❌ Error broadcasting comment update:', error);
      return 0;
    }
  }

  /**
   * ✅ NOVO: Broadcast quando comentário é deletado
   */
  broadcastCommentDelete(commentId: string): number {
    if (!this.isServerReady || !this.server) {
      this.logger.warn('WebSocket server not ready, cannot broadcast comment deletion');
      return 0;
    }

    try {
      // Broadcast para todos os usuários conectados
      const totalConnections = this.getTotalConnections();
      
      if (totalConnections > 0) {
        this.server.emit('commentDeleted', {
          type: 'COMMENT_DELETED',
          data: {
            commentId,
            deletedAt: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        });

        this.logger.log(`🗑️ Broadcast comment deletion to ${totalConnections} connected users`);
      }

      return totalConnections;
    } catch (error) {
      this.logger.error('❌ Error broadcasting comment deletion:', error);
      return 0;
    }
  }

  // ✅ ADICIONAR ESTES MÉTODOS ao src/infra/websocket/notification.gateway.ts

/**
 * ✅ NOVO: Broadcast quando like/dislike é criado, atualizado ou removido
 */
broadcastLikeUpdate(targetType: string, targetId: string, likeData: any): number {
  if (!this.isServerReady || !this.server) {
    this.logger.warn('WebSocket server not ready, cannot broadcast like update');
    return 0;
  }

  try {
    const roomName = `${targetType.toLowerCase()}_${targetId}`;
    const room = this.server.sockets.adapter?.rooms?.get(roomName);
    const userCount = room?.size || 0;

    if (userCount > 0) {
      this.server.to(roomName).emit('likeUpdate', {
        type: 'LIKE_UPDATE',
        data: likeData,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`👍 Broadcast like update to ${userCount} users viewing ${targetType} ${targetId}`);
    }

    // 📊 TAMBÉM BROADCAST PARA TODOS (para atualizar contadores em listas)
    this.server.emit('globalLikeUpdate', {
      type: 'GLOBAL_LIKE_UPDATE',
      targetType,
      targetId,
      likeCounts: likeData.likeCounts,
      action: likeData.action,
      timestamp: new Date().toISOString(),
    });

    return userCount;
  } catch (error) {
    this.logger.error('❌ Error broadcasting like update:', error);
    return 0;
  }
}

/**
 * ✅ NOVO: Evento WebSocket para assistir likes de uma entidade específica
 */
@SubscribeMessage('watchLikes')
handleWatchLikes(
  @ConnectedSocket() client: AuthenticatedSocket,
  @MessageBody() data: { targetType: string; targetId: string }
) {
  const roomName = `likes_${data.targetType.toLowerCase()}_${data.targetId}`;
  client.join(roomName);
  
  client.emit('watchingLikes', { 
    room: roomName, 
    targetType: data.targetType,
    targetId: data.targetId,
    timestamp: new Date().toISOString() 
  });

  this.logger.log(`👀 User ${client.userId} joined likes room ${roomName}`);
}

/**
 * ✅ NOVO: Broadcast para sala específica de likes
 */
broadcastToLikesRoom(targetType: string, targetId: string, data: any): number {
  if (!this.isServerReady || !this.server) {
    this.logger.warn('WebSocket server not ready, cannot broadcast to likes room');
    return 0;
  }

  try {
    const roomName = `likes_${targetType.toLowerCase()}_${targetId}`;
    const room = this.server.sockets.adapter?.rooms?.get(roomName);
    const userCount = room?.size || 0;

    if (userCount > 0) {
      this.server.to(roomName).emit('likesRoomUpdate', {
        type: 'LIKES_ROOM_UPDATE',
        data,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`📊 Broadcast to likes room ${roomName}: ${userCount} users`);
    }

    return userCount;
  } catch (error) {
    this.logger.error('❌ Error broadcasting to likes room:', error);
    return 0;
  }
}

/**
 * ✅ NOVO: Notificar usuário quando recebe like em seu conteúdo
 */
notifyUserLikeReceived(userId: string, likeData: any): boolean {
  if (!this.isServerReady || !this.server) {
    this.logger.warn('WebSocket server not ready, cannot send like notification');
    return false;
  }

  const userSockets = this.connectedUsers.get(userId);
  if (!userSockets || userSockets.length === 0) {
    this.logger.debug(`No active WebSocket connections for user ${userId}`);
    return false;
  }

  const notificationData = {
    type: 'like_received',
    data: {
      ...likeData,
      message: likeData.isLike 
        ? `${likeData.user?.name} curtiu seu ${likeData.targetType.toLowerCase()}`
        : `${likeData.user?.name} descurtiu seu ${likeData.targetType.toLowerCase()}`,
    },
    timestamp: new Date().toISOString(),
  };

  let sentCount = 0;
  userSockets.forEach(socket => {
    try {
      if (!socket.disconnected) {
        socket.emit('likeNotification', notificationData);
        sentCount++;
      }
    } catch (error) {
      this.logger.error(`Error sending like notification to socket ${socket.id}:`, error);
    }
  });

  this.logger.log(`👍 Sent like notification to user ${userId} (${sentCount}/${userSockets.length} connections)`);
  return sentCount > 0;
}

/**
 * ✅ NOVO: Teste de ping específico para likes
 */
@SubscribeMessage('pingLikes')
handlePingLikes(@ConnectedSocket() client: AuthenticatedSocket) {
  client.emit('pongLikes', { 
    timestamp: new Date().toISOString(),
    userId: client.userId,
    message: 'Like system WebSocket is working!'
  });
}
}
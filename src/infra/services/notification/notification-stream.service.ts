// src/infra/services/notification/notification-stream.service.ts - CORRIGIDO
import { Injectable } from '@nestjs/common';
import { Response } from 'express';

interface NotificationClient {
  userId: string;
  response: Response;
  lastPing: Date;
}

@Injectable()
export class NotificationStreamService {
  private clients = new Map<string, NotificationClient[]>();
  private channels = new Map<string, NotificationClient[]>(); // ✅ NOVO: Para rooms/channels
  private heartbeatInterval: NodeJS.Timeout;

  constructor() {
    // Configurar heartbeat para manter conexões vivas
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 30000); // 30 segundos
  }

  onModuleDestroy() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.closeAllConnections();
  }

  addClient(userId: string, response: Response): void {
    console.log(`[NotificationStreamService] Adding client for user ${userId}`);

    // Configurar headers SSE
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    });

    // Enviar mensagem de conexão inicial
    response.write('data: {"type":"connected","message":"Conectado ao sistema de notificações"}\n\n');

    const client: NotificationClient = {
      userId,
      response,
      lastPing: new Date(),
    };

    // Adicionar cliente à lista
    if (!this.clients.has(userId)) {
      this.clients.set(userId, []);
    }
    this.clients.get(userId)!.push(client);

    // Configurar limpeza quando cliente desconectar
    response.on('close', () => {
      this.removeClient(userId, response);
    });

    response.on('error', () => {
      this.removeClient(userId, response);
    });
  }

  removeClient(userId: string, response: Response): void {
    console.log(`[NotificationStreamService] Removing client for user ${userId}`);
    
    const userClients = this.clients.get(userId);
    if (userClients) {
      const filteredClients = userClients.filter(client => client.response !== response);
      
      if (filteredClients.length === 0) {
        this.clients.delete(userId);
      } else {
        this.clients.set(userId, filteredClients);
      }
    }

    // Remover de todos os channels também
    this.channels.forEach((channelClients, channelName) => {
      const filteredChannelClients = channelClients.filter(client => client.response !== response);
      if (filteredChannelClients.length === 0) {
        this.channels.delete(channelName);
      } else {
        this.channels.set(channelName, filteredChannelClients);
      }
    });

    // Fechar conexão se ainda estiver aberta
    if (!response.closed) {
      response.end();
    }
  }

  sendNotificationToUser(userId: string, notification: any): void {
    const userClients = this.clients.get(userId);
    if (!userClients || userClients.length === 0) {
      console.log(`[NotificationStreamService] No clients connected for user ${userId}`);
      return;
    }

    const data = JSON.stringify({
      type: 'notification',
      data: notification,
      timestamp: new Date().toISOString(),
    });

    console.log(`[NotificationStreamService] Sending notification to ${userClients.length} clients for user ${userId}`);

    userClients.forEach((client, index) => {
      try {
        if (!client.response.closed) {
          client.response.write(`data: ${data}\n\n`);
          client.lastPing = new Date();
        } else {
          console.log(`[NotificationStreamService] Client ${index} for user ${userId} is closed, removing...`);
          this.removeClient(userId, client.response);
        }
      } catch (error) {
        console.error(`[NotificationStreamService] Error sending to client ${index} for user ${userId}:`, error);
        this.removeClient(userId, client.response);
      }
    });
  }

  sendNotificationToModerators(notification: any): void {
    // Enviar para todos os usuários conectados (filtrar moderadores seria feito no frontend)
    this.clients.forEach((userClients, userId) => {
      this.sendNotificationToUser(userId, notification);
    });
  }

  // ✅ NOVOS MÉTODOS PARA COMPATIBILIDADE

  /**
   * Broadcast para todos os clientes conectados
   */
  broadcast(data: any): void {
    const broadcastData = JSON.stringify({
      type: 'broadcast',
      data,
      timestamp: new Date().toISOString(),
    });

    let totalSent = 0;
    this.clients.forEach((userClients, userId) => {
      userClients.forEach((client, index) => {
        try {
          if (!client.response.closed) {
            client.response.write(`data: ${broadcastData}\n\n`);
            client.lastPing = new Date();
            totalSent++;
          } else {
            this.removeClient(userId, client.response);
          }
        } catch (error) {
          console.error(`[NotificationStreamService] Broadcast error for user ${userId}, client ${index}:`, error);
          this.removeClient(userId, client.response);
        }
      });
    });

    console.log(`[NotificationStreamService] Broadcast sent to ${totalSent} clients`);
  }

  /**
   * ✅ NOVO: Broadcast para um channel/room específico
   */
  broadcastToChannel(channelName: string, data: any): void {
    const channelClients = this.channels.get(channelName);
    if (!channelClients || channelClients.length === 0) {
      console.log(`[NotificationStreamService] No clients in channel ${channelName}`);
      return;
    }

    const channelData = JSON.stringify({
      type: 'channel_broadcast',
      channel: channelName,
      data,
      timestamp: new Date().toISOString(),
    });

    let sentCount = 0;
    channelClients.forEach((client, index) => {
      try {
        if (!client.response.closed) {
          client.response.write(`data: ${channelData}\n\n`);
          client.lastPing = new Date();
          sentCount++;
        } else {
          this.removeClientFromChannel(channelName, client.response);
        }
      } catch (error) {
        console.error(`[NotificationStreamService] Channel broadcast error for ${channelName}, client ${index}:`, error);
        this.removeClientFromChannel(channelName, client.response);
      }
    });

    console.log(`[NotificationStreamService] Channel broadcast sent to ${sentCount} clients in ${channelName}`);
  }

  /**
   * ✅ NOVO: Adicionar cliente a um channel específico
   */
  addClientToChannel(channelName: string, userId: string, response: Response): void {
    const client: NotificationClient = {
      userId,
      response,
      lastPing: new Date(),
    };

    if (!this.channels.has(channelName)) {
      this.channels.set(channelName, []);
    }

    this.channels.get(channelName)!.push(client);
    console.log(`[NotificationStreamService] Added user ${userId} to channel ${channelName}`);
  }

  /**
   * ✅ NOVO: Remover cliente de um channel específico
   */
  removeClientFromChannel(channelName: string, response: Response): void {
    const channelClients = this.channels.get(channelName);
    if (channelClients) {
      const filteredClients = channelClients.filter(client => client.response !== response);
      
      if (filteredClients.length === 0) {
        this.channels.delete(channelName);
      } else {
        this.channels.set(channelName, filteredClients);
      }
    }
  }

  getConnectedUsersCount(): number {
    return this.clients.size;
  }

  getClientCount(): number {
    let total = 0;
    this.clients.forEach(userClients => {
      total += userClients.length;
    });
    return total;
  }

  getChannelCount(): number {
    return this.channels.size;
  }

  getChannelClients(channelName: string): number {
    return this.channels.get(channelName)?.length || 0;
  }

  private sendHeartbeat(): void {
    const heartbeatData = JSON.stringify({
      type: 'heartbeat',
      timestamp: new Date().toISOString(),
    });

    // Heartbeat para clientes principais
    this.clients.forEach((userClients, userId) => {
      userClients.forEach((client, index) => {
        try {
          if (!client.response.closed) {
            client.response.write(`data: ${heartbeatData}\n\n`);
            client.lastPing = new Date();
          } else {
            this.removeClient(userId, client.response);
          }
        } catch (error) {
          console.error(`[NotificationStreamService] Heartbeat error for user ${userId}, client ${index}:`, error);
          this.removeClient(userId, client.response);
        }
      });
    });

    // Heartbeat para clientes de channels
    this.channels.forEach((channelClients, channelName) => {
      channelClients.forEach((client, index) => {
        try {
          if (!client.response.closed) {
            client.response.write(`data: ${heartbeatData}\n\n`);
            client.lastPing = new Date();
          } else {
            this.removeClientFromChannel(channelName, client.response);
          }
        } catch (error) {
          console.error(`[NotificationStreamService] Channel heartbeat error for ${channelName}, client ${index}:`, error);
          this.removeClientFromChannel(channelName, client.response);
        }
      });
    });

    console.log(`[NotificationStreamService] Heartbeat sent to ${this.getClientCount()} clients in ${this.getChannelCount()} channels`);
  }

  private closeAllConnections(): void {
    // Fechar conexões principais
    this.clients.forEach((userClients, userId) => {
      userClients.forEach(client => {
        if (!client.response.closed) {
          client.response.end();
        }
      });
    });
    this.clients.clear();

    // Fechar conexões de channels
    this.channels.forEach((channelClients, channelName) => {
      channelClients.forEach(client => {
        if (!client.response.closed) {
          client.response.end();
        }
      });
    });
    this.channels.clear();
  }

  // Método para debug
  getConnectionStatus(): any {
    const status: any = {
      totalUsers: this.clients.size,
      totalClients: this.getClientCount(),
      totalChannels: this.getChannelCount(),
      users: {},
      channels: {},
    };

    this.clients.forEach((userClients, userId) => {
      status.users[userId] = {
        clientCount: userClients.length,
        clients: userClients.map(client => ({
          lastPing: client.lastPing,
          closed: client.response.closed,
        })),
      };
    });

    this.channels.forEach((channelClients, channelName) => {
      status.channels[channelName] = {
        clientCount: channelClients.length,
        clients: channelClients.map(client => ({
          userId: client.userId,
          lastPing: client.lastPing,
          closed: client.response.closed,
        })),
      };
    });

    return status;
  }
}
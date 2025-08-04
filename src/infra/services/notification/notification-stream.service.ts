// src/infra/web/services/notification-stream.service.ts
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

  private sendHeartbeat(): void {
    const heartbeatData = JSON.stringify({
      type: 'heartbeat',
      timestamp: new Date().toISOString(),
    });

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

    console.log(`[NotificationStreamService] Heartbeat sent to ${this.getClientCount()} clients`);
  }

  private closeAllConnections(): void {
    this.clients.forEach((userClients, userId) => {
      userClients.forEach(client => {
        if (!client.response.closed) {
          client.response.end();
        }
      });
    });
    this.clients.clear();
  }

  // Método para debug
  getConnectionStatus(): any {
    const status: any = {
      totalUsers: this.clients.size,
      totalClients: this.getClientCount(),
      users: {},
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

    return status;
  }
}

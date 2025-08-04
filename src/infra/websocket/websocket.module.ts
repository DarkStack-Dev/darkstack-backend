// src/infra/websocket/websocket.module.ts - NOVO
import { Module } from '@nestjs/common';
import { NotificationGateway } from './notification.gateway';
import { DatabaseModule } from '@/infra/repositories/database.module';
import { ServiceModule } from '@/infra/services/service.module';

@Module({
  imports: [
    DatabaseModule, // Para UserGatewayRepository
    ServiceModule,  // Para JwtService customizado
  ],
  providers: [
    NotificationGateway,
  ],
  exports: [
    NotificationGateway, // Exportar para usar em outros módulos
  ],
})
export class WebSocketModule {}
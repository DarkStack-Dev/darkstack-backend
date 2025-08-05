import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebModule } from './infra/web/web.module';
import { WebSocketModule } from '@/infra/websocket/websocket.module';

@Module({
  imports: [WebModule, WebSocketModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

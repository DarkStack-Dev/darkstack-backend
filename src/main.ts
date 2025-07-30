import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'node:path/win32';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS se necessário
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Configurar limite de upload
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Servir arquivos estáticos usando express diretamente
  const publicPath = join(__dirname, '..', 'public');
  app.use('/uploads', express.static(join(publicPath, 'uploads')));
  
  // Alternativa: servir todos os arquivos da pasta public
  // app.use(express.static(publicPath));


  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  console.log(`🚀 Servidor rodando na porta ${port}`);
  console.log(`📁 Arquivos estáticos em: ${join(__dirname, '..', 'public')}`);
  console.log(`🌐 URL base: ${process.env.BASE_URL || `http://localhost:${port}`}`);
  console.log(`📤 Upload multipart disponível em: POST /projects/multipart`);
}
bootstrap();

// src/infra/services/service.module.ts - ATUALIZADO
import { Module } from '@nestjs/common';
import { jsonWebTokenJwtServiceProvider } from './jwt/jsonwebtoken/jsonwebtoken.jwt.service.provider';
import { githubServiceProvider } from './github/github-api/github-api.service.provider';
import { googleApiServiceProvider } from './google/google-api/google-api.service.provider';
import { ImageUploadService } from './image-upload/image-upload.service';
import { railwayStorageServiceProvider } from './storage/railway/railway-storage.service.provider';
// ✅ ADICIONAR: NotificationStreamService
import { NotificationStreamService } from './notification/notification-stream.service';

@Module({
  providers: [
    jsonWebTokenJwtServiceProvider,
    githubServiceProvider,
    googleApiServiceProvider,
    railwayStorageServiceProvider,
    ImageUploadService,
    NotificationStreamService, // ✅ NOVO
  ],
  exports: [
    jsonWebTokenJwtServiceProvider,
    githubServiceProvider,
    googleApiServiceProvider,
    railwayStorageServiceProvider,
    ImageUploadService,
    NotificationStreamService, // ✅ NOVO
  ],
})
export class ServiceModule {}
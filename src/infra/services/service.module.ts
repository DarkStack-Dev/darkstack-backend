// Atualizar: src/infra/services/service.module.ts
import { Module } from '@nestjs/common';
import { jsonWebTokenJwtServiceProvider } from './jwt/jsonwebtoken/jsonwebtoken.jwt.service.provider';
import { githubServiceProvider } from './github/github-api/github-api.service.provider';

@Module({
  providers: [
    jsonWebTokenJwtServiceProvider,
    githubServiceProvider,
  ],
  exports: [
    jsonWebTokenJwtServiceProvider,
    githubServiceProvider,
  ],
})
export class ServiceModule {}
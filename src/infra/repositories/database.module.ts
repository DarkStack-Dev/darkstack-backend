
// Atualizar: src/infra/repositories/database.module.ts
import { Module } from '@nestjs/common';
import { userPrismaRepositoryProvider } from './prisma/user/user.prisma.repository.provider';
import { githubAccountPrismaRepositoryProvider } from './prisma/github-account/github-account.prisma.repository.provider';
import { googleAccountPrismaRepositoryProvider } from './prisma/google-account/google-account.prisma.repository.provider';

@Module({
  providers: [
    userPrismaRepositoryProvider,
    githubAccountPrismaRepositoryProvider,
    googleAccountPrismaRepositoryProvider
  ],
  exports: [
    userPrismaRepositoryProvider,
    githubAccountPrismaRepositoryProvider,
    googleAccountPrismaRepositoryProvider,
  ],
})
export class DatabaseModule {}
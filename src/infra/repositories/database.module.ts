
// Atualizar: src/infra/repositories/database.module.ts
import { Module } from '@nestjs/common';
import { userPrismaRepositoryProvider } from './prisma/user/user.prisma.repository.provider';
import { githubAccountPrismaRepositoryProvider } from './prisma/github-account/github-account.prisma.repository.provider';

@Module({
  providers: [
    userPrismaRepositoryProvider,
    githubAccountPrismaRepositoryProvider,
  ],
  exports: [
    userPrismaRepositoryProvider,
    githubAccountPrismaRepositoryProvider,
  ],
})
export class DatabaseModule {}
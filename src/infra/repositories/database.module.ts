// src/infra/repositories/database.module.ts - ATUALIZADO
import { Module } from '@nestjs/common';
import { userPrismaRepositoryProvider } from './prisma/user/user.prisma.repository.provider';
import { githubAccountPrismaRepositoryProvider } from './prisma/github-account/github-account.prisma.repository.provider';
import { googleAccountPrismaRepositoryProvider } from './prisma/google-account/google-account.prisma.repository.provider';
import { projectsPrismaRepositoryProvider } from './prisma/projects/projects.prisma.repository.provider';
import { articlePrismaRepositoryProvider } from './prisma/article/article.prisma.repository.provider';
// ✅ ADICIONAR: Notification repository provider
import { notificationPrismaRepositoryProvider } from './prisma/notification/notification.prisma.repository.provider';

@Module({
  providers: [
    userPrismaRepositoryProvider,
    githubAccountPrismaRepositoryProvider,
    googleAccountPrismaRepositoryProvider,
    projectsPrismaRepositoryProvider,
    articlePrismaRepositoryProvider,
    notificationPrismaRepositoryProvider, // ✅ NOVO
  ],
  exports: [
    userPrismaRepositoryProvider,
    githubAccountPrismaRepositoryProvider,
    googleAccountPrismaRepositoryProvider,
    projectsPrismaRepositoryProvider,
    articlePrismaRepositoryProvider,
    notificationPrismaRepositoryProvider, // ✅ NOVO
  ],
})
export class DatabaseModule {}
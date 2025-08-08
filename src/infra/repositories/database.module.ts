// 🏗️ 1. DATABASE MODULE - Atualizar src/infra/repositories/database.module.ts
import { Module } from '@nestjs/common';
import { userPrismaRepositoryProvider } from './prisma/user/user.prisma.repository.provider';
import { articlePrismaRepositoryProvider } from './prisma/article/article.prisma.repository.provider';
import { notificationPrismaRepositoryProvider } from './prisma/notification/notification.prisma.repository.provider';
import { projectsPrismaRepositoryProvider } from './prisma/projects/projects.prisma.repository.provider';
import { githubAccountPrismaRepositoryProvider } from './prisma/github-account/github-account.prisma.repository.provider';
import { googleAccountPrismaRepositoryProvider } from './prisma/google-account/google-account.prisma.repository.provider';
// ✅ ADICIONAR - Comment Repository Provider
import { commentPrismaRepositoryProvider } from './prisma/comment/comment.prisma.repository.provider';
// ✅ ADICIONAR: Like Repository Provider
import { likePrismaRepositoryProvider } from './prisma/like/like.prisma.repository.provider';

@Module({
  providers: [
    // Existing providers
    userPrismaRepositoryProvider,
    articlePrismaRepositoryProvider,
    notificationPrismaRepositoryProvider,
    projectsPrismaRepositoryProvider,
    githubAccountPrismaRepositoryProvider,
    googleAccountPrismaRepositoryProvider,
    // ✅ ADICIONAR - Comment Repository
    commentPrismaRepositoryProvider,
    // ✅ ADICIONAR: Like Repository
    likePrismaRepositoryProvider,
  ],
  exports: [
    // Existing exports
    userPrismaRepositoryProvider,
    articlePrismaRepositoryProvider,
    notificationPrismaRepositoryProvider,
    projectsPrismaRepositoryProvider,
    githubAccountPrismaRepositoryProvider,
    googleAccountPrismaRepositoryProvider,
    // ✅ ADICIONAR - Export Comment Repository
    commentPrismaRepositoryProvider,
    // ✅ ADICIONAR: Export Like Repository
    likePrismaRepositoryProvider,
  ],
})
export class DatabaseModule {}
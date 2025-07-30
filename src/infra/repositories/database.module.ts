
// Atualizar: src/infra/repositories/database.module.ts
import { Module } from '@nestjs/common';
import { userPrismaRepositoryProvider } from './prisma/user/user.prisma.repository.provider';
import { githubAccountPrismaRepositoryProvider } from './prisma/github-account/github-account.prisma.repository.provider';
import { googleAccountPrismaRepositoryProvider } from './prisma/google-account/google-account.prisma.repository.provider';
import { projectsPrismaRepositoryProvider } from './prisma/projects/projects.prisma.repository.provider';
// ✅ ADICIONAR: Article repository provider
import { articlePrismaRepositoryProvider } from './prisma/article/article.prisma.repository.provider';
@Module({
  providers: [
    userPrismaRepositoryProvider,
    githubAccountPrismaRepositoryProvider,
    googleAccountPrismaRepositoryProvider,
    projectsPrismaRepositoryProvider,
    articlePrismaRepositoryProvider, // ✅ NOVO
  ],
  exports: [
    userPrismaRepositoryProvider,
    githubAccountPrismaRepositoryProvider,
    googleAccountPrismaRepositoryProvider,
    projectsPrismaRepositoryProvider,
    articlePrismaRepositoryProvider, // ✅ NOVO
  ],
})
export class DatabaseModule {}
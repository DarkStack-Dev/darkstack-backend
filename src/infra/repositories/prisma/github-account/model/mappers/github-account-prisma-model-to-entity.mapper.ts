// src/infra/repositories/prisma/github-account/model/mappers/github-account-prisma-model-to-entity.mapper.ts
import { GitHubAccount } from '@/domain/entities/github-account/github-account.entity';
import GitHubAccountPrismaModel from '../github-account.prisma.model';

export class GitHubAccountPrismaModelToEntityMapper {
  public static map(model: GitHubAccountPrismaModel): GitHubAccount {
    return GitHubAccount.with({
      id: model.id,
      userId: model.userId,
      githubId: model.githubId,
      username: model.username,
      bio: model.bio || undefined,
      publicRepos: model.publicRepos,
      followers: model.followers,
      following: model.following,
      githubAccessToken: model.githubAccessToken || undefined,
      githubRefreshToken: model.githubRefreshToken || undefined,
      tokenExpiresAt: model.tokenExpiresAt || undefined,
      lastSyncAt: model.lastSyncAt,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      isActive: true, // Assumindo que sempre é ativo, você pode adicionar este campo no schema se necessário
    });
  }
}

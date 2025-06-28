// src/infra/repositories/prisma/github-account/model/mappers/github-account-entity-to-prisma-model.mapper.ts
import { GitHubAccount } from '@/domain/entities/github-account/github-account.entity';
import GitHubAccountPrismaModel from '../github-account.prisma.model';

export class GitHubAccountEntityToPrismaModelMapper {
  public static map(githubAccount: GitHubAccount): Omit<GitHubAccountPrismaModel, 'user'> {
    return {
      id: githubAccount.getId(),
      userId: githubAccount.getUserId(),
      githubId: githubAccount.getGithubId(),
      username: githubAccount.getUsername(),
      bio: githubAccount.getBio() || null,
      publicRepos: githubAccount.getPublicRepos(),
      followers: githubAccount.getFollowers(),
      following: githubAccount.getFollowing(),
      githubAccessToken: githubAccount.getGithubAccessToken() || null,
      githubRefreshToken: githubAccount.getGithubRefreshToken() || null,
      tokenExpiresAt: githubAccount.getTokenExpiresAt() || null,
      lastSyncAt: githubAccount.getLastSyncAt(),
      createdAt: githubAccount.getCreatedAt(),
      updatedAt: githubAccount.getUpdatedAt(),
    };
  }
}
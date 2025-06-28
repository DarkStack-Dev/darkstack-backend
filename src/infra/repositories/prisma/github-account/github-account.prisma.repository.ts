// src/infra/repositories/prisma/github-account/github-account.prisma.repository.ts

import { Injectable } from '@nestjs/common';
import { GitHubAccountGatewayRepository } from '@/domain/repositories/github-account/github-account.gateway.repository';
import { GitHubAccount } from '@/domain/entities/github-account/github-account.entity';
import { prismaClient } from '../client.prisma';

@Injectable()
export class GitHubAccountPrismaRepository extends GitHubAccountGatewayRepository {
  
  async findByGithubId(githubId: string): Promise<GitHubAccount | null> {
    const model = await prismaClient.gitHubAccount.findUnique({
      where: {
        githubId: githubId,
      },
    });

    if (!model) {
      return null;
    }

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
      isActive: true, // Assumindo que não há campo isActive no Prisma model
    });
  }

  async findByUserId(userId: string): Promise<GitHubAccount | null> {
    const model = await prismaClient.gitHubAccount.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!model) {
      return null;
    }

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
      isActive: true,
    });
  }

  async create(githubAccount: GitHubAccount): Promise<void> {
    await prismaClient.gitHubAccount.create({
      data: {
        id: githubAccount.getId(),
        userId: githubAccount.getUserId(),
        githubId: githubAccount.getGithubId(),
        username: githubAccount.getUsername(),
        bio: githubAccount.getBio(),
        publicRepos: githubAccount.getPublicRepos(),
        followers: githubAccount.getFollowers(),
        following: githubAccount.getFollowing(),
        githubAccessToken: githubAccount.getGithubAccessToken(),
        githubRefreshToken: githubAccount.getGithubRefreshToken(),
        tokenExpiresAt: githubAccount.getTokenExpiresAt(),
        lastSyncAt: githubAccount.getLastSyncAt(),
        createdAt: githubAccount.getCreatedAt(),
        updatedAt: githubAccount.getUpdatedAt(),
      },
    });
  }

  async update(githubAccount: GitHubAccount): Promise<void> {
    await prismaClient.gitHubAccount.update({
      where: {
        id: githubAccount.getId(),
      },
      data: {
        username: githubAccount.getUsername(),
        bio: githubAccount.getBio(),
        publicRepos: githubAccount.getPublicRepos(),
        followers: githubAccount.getFollowers(),
        following: githubAccount.getFollowing(),
        githubAccessToken: githubAccount.getGithubAccessToken(),
        githubRefreshToken: githubAccount.getGithubRefreshToken(),
        tokenExpiresAt: githubAccount.getTokenExpiresAt(),
        lastSyncAt: githubAccount.getLastSyncAt(),
        updatedAt: githubAccount.getUpdatedAt(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prismaClient.gitHubAccount.delete({
      where: {
        id: id,
      },
    });
  }
}
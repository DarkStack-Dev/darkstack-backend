// src/domain/repositories/github-account/github-account.gateway.repository.ts

import { GitHubAccount } from "@/domain/entities/github-account/github-account.entity";

export abstract class GitHubAccountGatewayRepository {
  abstract findByGithubId(githubId: string): Promise<GitHubAccount | null>;
  abstract findByUserId(userId: string): Promise<GitHubAccount | null>;
  abstract create(githubAccount: GitHubAccount): Promise<void>;
  abstract update(githubAccount: GitHubAccount): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
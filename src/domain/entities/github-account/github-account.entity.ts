// src/domain/entities/github-account/github-account.entity.ts

import { Entity } from "@/domain/shared/entities/entity";
import { Utils } from "@/shared/utils/utils";

export type GitHubAccountCreateDto = {
  userId: string;
  githubId: string;
  username: string;
  bio?: string;
  publicRepos: number;
  followers: number;
  following: number;
  githubAccessToken: string;
  githubRefreshToken?: string;
  tokenExpiresAt?: Date;
};

export type GitHubAccountWithDto = {
  id: string;
  userId: string;
  githubId: string;
  username: string;
  bio?: string;
  publicRepos: number;
  followers: number;
  following: number;
  githubAccessToken?: string;
  githubRefreshToken?: string;
  tokenExpiresAt?: Date;
  lastSyncAt: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
};

export class GitHubAccount extends Entity {
  private userId: string;
  private githubId: string;
  private username: string;
  private bio?: string;
  private publicRepos: number;
  private followers: number;
  private following: number;
  private githubAccessToken?: string;
  private githubRefreshToken?: string;
  private tokenExpiresAt?: Date;
  private lastSyncAt: Date;

  protected constructor(
    id: string,
    userId: string,
    githubId: string,
    username: string,
    bio: string | undefined,
    publicRepos: number,
    followers: number,
    following: number,
    githubAccessToken: string | undefined,
    githubRefreshToken: string | undefined,
    tokenExpiresAt: Date | undefined,
    lastSyncAt: Date,
    createdAt: Date,
    updatedAt: Date,
    isActive: boolean
  ) {
    super(id, createdAt, updatedAt, isActive);
    this.userId = userId;
    this.githubId = githubId;
    this.username = username;
    this.bio = bio;
    this.publicRepos = publicRepos;
    this.followers = followers;
    this.following = following;
    this.githubAccessToken = githubAccessToken;
    this.githubRefreshToken = githubRefreshToken;
    this.tokenExpiresAt = tokenExpiresAt;
    this.lastSyncAt = lastSyncAt;
    this.validate();
  }

  public static create({
    userId,
    githubId,
    username,
    bio,
    publicRepos,
    followers,
    following,
    githubAccessToken,
    githubRefreshToken,
    tokenExpiresAt,
  }: GitHubAccountCreateDto): GitHubAccount {
    const id = Utils.GenerateUUID();
    const isActive = true;
    const now = new Date();
    const createdAt = now;
    const updatedAt = now;
    const lastSyncAt = now;

    return new GitHubAccount(
      id,
      userId,
      githubId,
      username,
      bio,
      publicRepos,
      followers,
      following,
      githubAccessToken,
      githubRefreshToken,
      tokenExpiresAt,
      lastSyncAt,
      createdAt,
      updatedAt,
      isActive
    );
  }

  public static with({
    id,
    userId,
    githubId,
    username,
    bio,
    publicRepos,
    followers,
    following,
    githubAccessToken,
    githubRefreshToken,
    tokenExpiresAt,
    lastSyncAt,
    createdAt,
    updatedAt,
    isActive = true,
  }: GitHubAccountWithDto): GitHubAccount {
    return new GitHubAccount(
      id,
      userId,
      githubId,
      username,
      bio,
      publicRepos,
      followers,
      following,
      githubAccessToken,
      githubRefreshToken,
      tokenExpiresAt,
      lastSyncAt,
      createdAt,
      updatedAt,
      isActive
    );
  }

  protected validate(): void {
    // Implementar validação se necessário
  }

  // Getters
  public getUserId(): string {
    return this.userId;
  }

  public getGithubId(): string {
    return this.githubId;
  }

  public getUsername(): string {
    return this.username;
  }

  public getBio(): string | undefined {
    return this.bio;
  }

  public getPublicRepos(): number {
    return this.publicRepos;
  }

  public getFollowers(): number {
    return this.followers;
  }

  public getFollowing(): number {
    return this.following;
  }

  public getGithubAccessToken(): string | undefined {
    return this.githubAccessToken;
  }

  public getGithubRefreshToken(): string | undefined {
    return this.githubRefreshToken;
  }

  public getTokenExpiresAt(): Date | undefined {
    return this.tokenExpiresAt;
  }

  public getLastSyncAt(): Date {
    return this.lastSyncAt;
  }

  // Métodos de atualização
  public updateTokens(
    accessToken: string,
    refreshToken?: string,
    expiresAt?: Date
  ): void {
    this.githubAccessToken = accessToken;
    this.githubRefreshToken = refreshToken;
    this.tokenExpiresAt = expiresAt;
    this.lastSyncAt = new Date();
    this.hasUpdatedAt();
  }

  public updateProfile(
    bio: string | undefined,
    publicRepos: number,
    followers: number,
    following: number
  ): void {
    this.bio = bio;
    this.publicRepos = publicRepos;
    this.followers = followers;
    this.following = following;
    this.lastSyncAt = new Date();
    this.hasUpdatedAt();
  }
}
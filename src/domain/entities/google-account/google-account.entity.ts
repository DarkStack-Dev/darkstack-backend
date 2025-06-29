// src/domain/entities/google-account/google-account.entity.ts

import { Entity } from "@/domain/shared/entities/entity";
import { Utils } from "@/shared/utils/utils";

export type GoogleAccountCreateDto = {
  userId: string;
  googleId: string;
  googleEmail: string;
  picture?: string;
  locale?: string;
  googleAccessToken: string;
  googleRefreshToken?: string;
  tokenExpiresAt?: Date;
};

export type GoogleAccountWithDto = {
  id: string;
  userId: string;
  googleId: string;
  googleEmail: string;
  picture?: string;
  locale?: string;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  tokenExpiresAt?: Date;
  lastSyncAt: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
};

export class GoogleAccount extends Entity {
  private userId: string;
  private googleId: string;
  private googleEmail: string;
  private picture?: string;
  private locale?: string;
  private googleAccessToken?: string;
  private googleRefreshToken?: string;
  private tokenExpiresAt?: Date;
  private lastSyncAt: Date;

  protected constructor(
    id: string,
    userId: string,
    googleId: string,
    googleEmail: string,
    picture: string | undefined,
    locale: string | undefined,
    googleAccessToken: string | undefined,
    googleRefreshToken: string | undefined,
    tokenExpiresAt: Date | undefined,
    lastSyncAt: Date,
    createdAt: Date,
    updatedAt: Date,
    isActive: boolean
  ) {
    super(id, createdAt, updatedAt, isActive);
    this.userId = userId;
    this.googleId = googleId;
    this.googleEmail = googleEmail;
    this.picture = picture;
    this.locale = locale;
    this.googleAccessToken = googleAccessToken;
    this.googleRefreshToken = googleRefreshToken;
    this.tokenExpiresAt = tokenExpiresAt;
    this.lastSyncAt = lastSyncAt;
    this.validate();
  }

  public static create({
    userId,
    googleId,
    googleEmail,
    picture,
    locale,
    googleAccessToken,
    googleRefreshToken,
    tokenExpiresAt,
  }: GoogleAccountCreateDto): GoogleAccount {
    const id = Utils.GenerateUUID();
    const isActive = true;
    const now = new Date();
    const createdAt = now;
    const updatedAt = now;
    const lastSyncAt = now;

    return new GoogleAccount(
      id,
      userId,
      googleId,
      googleEmail,
      picture,
      locale,
      googleAccessToken,
      googleRefreshToken,
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
    googleId,
    googleEmail,
    picture,
    locale,
    googleAccessToken,
    googleRefreshToken,
    tokenExpiresAt,
    lastSyncAt,
    createdAt,
    updatedAt,
    isActive = true,
  }: GoogleAccountWithDto): GoogleAccount {
    return new GoogleAccount(
      id,
      userId,
      googleId,
      googleEmail,
      picture,
      locale,
      googleAccessToken,
      googleRefreshToken,
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

  public getGoogleId(): string {
    return this.googleId;
  }

  public getGoogleEmail(): string {
    return this.googleEmail;
  }

  public getPicture(): string | undefined {
    return this.picture;
  }

  public getLocale(): string | undefined {
    return this.locale;
  }

  public getGoogleAccessToken(): string | undefined {
    return this.googleAccessToken;
  }

  public getGoogleRefreshToken(): string | undefined {
    return this.googleRefreshToken;
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
    this.googleAccessToken = accessToken;
    this.googleRefreshToken = refreshToken;
    this.tokenExpiresAt = expiresAt;
    this.lastSyncAt = new Date();
    this.hasUpdatedAt();
  }

  public updateProfile(
    picture: string | undefined,
    locale: string | undefined
  ): void {
    this.picture = picture;
    this.locale = locale;
    this.lastSyncAt = new Date();
    this.hasUpdatedAt();
  }
}
// src/infra/repositories/prisma/google-account/google-account.prisma.repository.ts

import { Injectable } from '@nestjs/common';
import { GoogleAccountGatewayRepository } from '@/domain/repositories/google-account/google-account.gateway.repository';
import { GoogleAccount } from '@/domain/entities/google-account/google-account.entity';
import { prismaClient } from '../client.prisma';

@Injectable()
export class GoogleAccountPrismaRepository extends GoogleAccountGatewayRepository {
  
  async findByGoogleId(googleId: string): Promise<GoogleAccount | null> {
    const model = await prismaClient.googleAccount.findUnique({
      where: {
        googleId: googleId,
      },
    });

    if (!model) {
      return null;
    }

    return GoogleAccount.with({
      id: model.id,
      userId: model.userId,
      googleId: model.googleId,
      googleEmail: model.googleEmail,
      picture: model.picture || undefined,
      locale: model.locale || undefined,
      googleAccessToken: model.googleAccessToken || undefined,
      googleRefreshToken: model.googleRefreshToken || undefined,
      tokenExpiresAt: model.tokenExpiresAt || undefined,
      lastSyncAt: model.lastSyncAt,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      isActive: true, // Assumindo que não há campo isActive no Prisma model
    });
  }

  async findByUserId(userId: string): Promise<GoogleAccount | null> {
    const model = await prismaClient.googleAccount.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!model) {
      return null;
    }

    return GoogleAccount.with({
      id: model.id,
      userId: model.userId,
      googleId: model.googleId,
      googleEmail: model.googleEmail,
      picture: model.picture || undefined,
      locale: model.locale || undefined,
      googleAccessToken: model.googleAccessToken || undefined,
      googleRefreshToken: model.googleRefreshToken || undefined,
      tokenExpiresAt: model.tokenExpiresAt || undefined,
      lastSyncAt: model.lastSyncAt,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      isActive: true,
    });
  }

  async create(googleAccount: GoogleAccount): Promise<void> {
    await prismaClient.googleAccount.create({
      data: {
        id: googleAccount.getId(),
        userId: googleAccount.getUserId(),
        googleId: googleAccount.getGoogleId(),
        googleEmail: googleAccount.getGoogleEmail(),
        picture: googleAccount.getPicture(),
        locale: googleAccount.getLocale(),
        googleAccessToken: googleAccount.getGoogleAccessToken(),
        googleRefreshToken: googleAccount.getGoogleRefreshToken(),
        tokenExpiresAt: googleAccount.getTokenExpiresAt(),
        lastSyncAt: googleAccount.getLastSyncAt(),
        createdAt: googleAccount.getCreatedAt(),
        updatedAt: googleAccount.getUpdatedAt(),
      },
    });
  }

  async update(googleAccount: GoogleAccount): Promise<void> {
    await prismaClient.googleAccount.update({
      where: {
        id: googleAccount.getId(),
      },
      data: {
        googleEmail: googleAccount.getGoogleEmail(),
        picture: googleAccount.getPicture(),
        locale: googleAccount.getLocale(),
        googleAccessToken: googleAccount.getGoogleAccessToken(),
        googleRefreshToken: googleAccount.getGoogleRefreshToken(),
        tokenExpiresAt: googleAccount.getTokenExpiresAt(),
        lastSyncAt: googleAccount.getLastSyncAt(),
        updatedAt: googleAccount.getUpdatedAt(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prismaClient.googleAccount.delete({
      where: {
        id: id,
      },
    });
  }
}
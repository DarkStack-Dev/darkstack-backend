// src/infra/repositories/prisma/user/user.prisma.repository.ts

import { Injectable } from '@nestjs/common';
import { UserGatewayRepository } from 'src/domain/repositories/user/user.gateway.repository';
import { prismaClient } from '../client.prisma';
import { User } from '@/domain/entities/user/user.entitty';
import { UserPrismaModelToUserEntityMapper } from './model/mappers/user-prisma-model-to-user-entity.mapper';
import { UserEntityToUserPrismaModelMapper } from './model/mappers/user-entity-to-user-prisma-model.mapper';

@Injectable()
export class UserPrismaRepository extends UserGatewayRepository {
  public constructor() {
    super();
  }

  public async findByEmail(email: string): Promise<User | null> {
    const model = await prismaClient.user.findUnique({
      where: { email },
      include: {
        emailAuth: true, // ✅ Incluir senha se existir
      },
    });

    if (!model) {
      return null;
    }

    return UserPrismaModelToUserEntityMapper.map(model);
  }

  public async findById(id: string): Promise<User | null> {
    const model = await prismaClient.user.findUnique({
      where: { id },
      include: {
        emailAuth: true, // ✅ Incluir senha se existir
      },
    });

    if (!model) {
      return null;
    }

    return UserPrismaModelToUserEntityMapper.map(model);
  }

  public async create(user: User): Promise<void> {
    const userData = UserEntityToUserPrismaModelMapper.map(user);
    const hasPassword = user.getPassword() && user.getPassword() !== '';

    // ✅ Usar transaction para criar User + EmailAuth se tiver senha
    await prismaClient.$transaction(async (tx) => {
      // Criar o usuário
      await tx.user.create({
        data: userData,
      });

      // ✅ Se tem senha, criar EmailAuth
      if (hasPassword) {
        await tx.emailAuth.create({
          data: {
            userId: user.getId(),
            password: user.getPassword(),
          },
        });
      }
    });
  }
}
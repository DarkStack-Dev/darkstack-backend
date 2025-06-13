import { UserGatewayRepository } from 'src/domain/repositories/user/user.gateway.repository';
import { prismaClient } from '../client.prisma';
import { User } from 'src/domain/entities/user.entitty';
import { UserPrismaModelToUserEntityMapper } from './model/mappers/user-prisma-model-to-user-entity.mapper';
import { UserEntityToUserPrismaModelMapper } from './model/mappers/user-entity-to-user-prisma-model.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserPrismaRepository extends UserGatewayRepository {
  public constructor() {
    super();
  }

  public async findByEmail(email: string): Promise<User | null> {
    const aModel = await prismaClient.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!aModel) {
      return null;
    }

    const anUser = UserPrismaModelToUserEntityMapper.map(aModel);

    return anUser;
  }

  public async findById(id: string): Promise<User | null> {
    const aModel = await prismaClient.user.findUnique({
      where: {
        id: id,
      },
    });

    if (!aModel) {
      return null;
    }

    const anUser = UserPrismaModelToUserEntityMapper.map(aModel);

    return anUser;
  }

  public async create(user: User): Promise<void> {
    const aModel = UserEntityToUserPrismaModelMapper.map(user);
    await prismaClient.user.create({
      data: aModel,
    });
  }
}
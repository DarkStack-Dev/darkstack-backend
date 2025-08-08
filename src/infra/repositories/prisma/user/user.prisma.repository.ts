// src/infra/repositories/prisma/user/user.prisma.repository.ts - ATUALIZADO

import { Injectable } from '@nestjs/common';
import { UserGatewayRepository, UserSearchFilters, PaginatedUsersResult } from 'src/domain/repositories/user/user.gateway.repository';
import { prismaClient } from '../client.prisma';
import { User } from '@/domain/entities/user/user.entitty';
import { UserPrismaModelToUserEntityMapper } from './model/mappers/user-prisma-model-to-user-entity.mapper';
import { UserEntityToUserPrismaModelMapper } from './model/mappers/user-entity-to-user-prisma-model.mapper';
import { UserRole } from 'generated/prisma';

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

  // ✅ NOVO: Método para atualizar usuário
  public async update(user: User): Promise<void> {
    const userData = UserEntityToUserPrismaModelMapper.map(user);
    const hasPassword = user.getPassword() && user.getPassword() !== '';

    await prismaClient.$transaction(async (tx) => {
      // Atualizar dados do usuário
      await tx.user.update({
        where: { id: user.getId() },
        data: {
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar,
          roles: userData.roles,
          isActive: userData.isActive,
          emailVerified: userData.emailVerified,
          updatedAt: new Date(),
        },
      });

      // Verificar se existe EmailAuth
      const existingAuth = await tx.emailAuth.findUnique({
        where: { userId: user.getId() },
      });

      if (hasPassword) {
        if (existingAuth) {
          // Atualizar senha existente
          await tx.emailAuth.update({
            where: { userId: user.getId() },
            data: {
              password: user.getPassword(),
              updatedAt: new Date(),
            },
          });
        } else {
          // Criar nova entrada de senha
          await tx.emailAuth.create({
            data: {
              userId: user.getId(),
              password: user.getPassword(),
            },
          });
        }
      } else if (existingAuth) {
        // Se não tem senha mas existe EmailAuth, remover
        await tx.emailAuth.delete({
          where: { userId: user.getId() },
        });
      }
    });
  }

  // ✅ NOVO: Método para listagem com filtros e paginação
  public async findAll(filters?: UserSearchFilters): Promise<PaginatedUsersResult> {
    const {
      search,
      roles,
      isActive,
      emailVerified,
      createdAfter,
      createdBefore,
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters || {};

    // Construir where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (roles && roles.length > 0) {
      where.roles = { hasSome: roles };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (emailVerified !== undefined) {
      where.emailVerified = emailVerified;
    }

    if (createdAfter || createdBefore) {
      where.createdAt = {};
      if (createdAfter) where.createdAt.gte = createdAfter;
      if (createdBefore) where.createdAt.lte = createdBefore;
    }

    // Executar query com contagem
    const [users, total] = await Promise.all([
      prismaClient.user.findMany({
        where,
        include: {
          emailAuth: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        take: limit,
        skip: offset,
      }),
      prismaClient.user.count({ where }),
    ]);

    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map(UserPrismaModelToUserEntityMapper.map),
      total,
      page,
      pageSize: limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  // ✅ NOVO: Método para soft delete
  public async softDelete(id: string): Promise<void> {
    await prismaClient.user.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
  }

  // ✅ NOVO: Método para contagem com filtros
  public async count(filters?: Partial<UserSearchFilters>): Promise<number> {
    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.roles && filters.roles.length > 0) {
      where.roles = { hasSome: filters.roles };
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.emailVerified !== undefined) {
      where.emailVerified = filters.emailVerified;
    }

    return prismaClient.user.count({ where });
  }

  // ✅ NOVO: Método para buscar por role
  public async findByRole(role: UserRole): Promise<User[]> {
    const models = await prismaClient.user.findMany({
      where: {
        roles: { has: role },
        isActive: true,
      },
      include: {
        emailAuth: true,
        githubAccount: true,
        googleAccount: true,
      },
    });

    return models.map(UserPrismaModelToUserEntityMapper.map);
  }
}
// src/infra/repositories/prisma/user/model/mappers/user-prisma-model-to-user-entity.mapper.ts

import { User } from '@/domain/entities/user/user.entitty';

export class UserPrismaModelToUserEntityMapper {
  public static map(model: any): User {
    return User.with({
      id: model.id,
      name: model.name,
      email: model.email,
      password: model.emailAuth?.password || '', // ✅ Senha vem do emailAuth ou vazia (OAuth)
      roles: model.roles as any,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      isActive: model.isActive,
    });
  }
}
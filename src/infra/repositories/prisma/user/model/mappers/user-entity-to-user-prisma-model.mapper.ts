// src/infra/repositories/prisma/user/model/mappers/user-entity-to-user-prisma-model.mapper.ts - MELHORADO

import { User } from '@/domain/entities/user/user.entitty';

export class UserEntityToUserPrismaModelMapper {
  public static map(user: User) {
    return {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail(),
      avatar: user.getAvatar() || null, // ✅ IMPLEMENTADO: usar avatar real
      roles: user.getRoles(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
      isActive: user.getIsActivate(),
      emailVerified: user.isEmailVerified(), // ✅ IMPLEMENTADO: usar verificação real
    };
  }
}
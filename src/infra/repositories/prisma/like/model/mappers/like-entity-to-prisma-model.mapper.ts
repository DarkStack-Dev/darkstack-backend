// src/infra/repositories/prisma/like/model/mappers/like-entity-to-prisma-model.mapper.ts
import { Like } from '@/domain/entities/like/like.entity';

export class LikeEntityToPrismaModelMapper {
  public static map(entity: Like) {
    return {
      id: entity.getId(),
      userId: entity.getUserId(),
      targetId: entity.getTargetId(),
      targetType: entity.getTargetType(),
      isLike: entity.getIsLike(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };
  }
}

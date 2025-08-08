// src/infra/repositories/prisma/like/model/mappers/like-prisma-model-to-entity.mapper.ts
import { Like, LikeTarget } from '@/domain/entities/like/like.entity';

export class LikePrismaModelToEntityMapper {
  public static map(model: any): Like {
    return Like.with({
      id: model.id,
      userId: model.userId,
      targetId: model.targetId,
      targetType: model.targetType as LikeTarget,
      isLike: model.isLike,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }
}
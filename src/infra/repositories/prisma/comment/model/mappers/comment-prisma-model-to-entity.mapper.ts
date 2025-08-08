// src/infra/repositories/prisma/comment/model/mappers/comment-prisma-model-to-entity.mapper.ts
import { Comment, CommentTarget } from '@/domain/entities/comment/comment.entity';

export class CommentPrismaModelToEntityMapper {
  public static map(model: any): Comment {
    return Comment.with({
      id: model.id,
      content: model.content,
      isEdited: model.isEdited,
      isDeleted: model.isDeleted,
      authorId: model.authorId,
      parentId: model.parentId,
      repliesCount: model.repliesCount,
      targetId: model.targetId,
      targetType: model.targetType as CommentTarget,
      approved: model.approved,
      approvedById: model.approvedById,
      approvedAt: model.approvedAt,
      rejectionReason: model.rejectionReason,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }
}
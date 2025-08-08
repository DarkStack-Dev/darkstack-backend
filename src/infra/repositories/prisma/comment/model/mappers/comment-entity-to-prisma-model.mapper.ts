// src/infra/repositories/prisma/comment/model/mappers/comment-entity-to-prisma-model.mapper.ts
import { Comment } from '@/domain/entities/comment/comment.entity';

export class CommentEntityToPrismaModelMapper {
  public static map(entity: Comment) {
    return {
      id: entity.getId(),
      content: entity.getContent(),
      isEdited: entity.getIsEdited(),
      isDeleted: entity.getIsDeleted(),
      authorId: entity.getAuthorId(),
      parentId: entity.getParentId(),
      repliesCount: entity.getRepliesCount(),
      targetId: entity.getTargetId(),
      targetType: entity.getTargetType(),
      approved: entity.getApproved(),
      approvedById: entity.getApprovedById(),
      approvedAt: entity.getApprovedAt(),
      rejectionReason: entity.getRejectionReason(),
      createdAt: entity.getCreatedAt(),
      updatedAt: entity.getUpdatedAt(),
    };
  }
}
// src/infra/web/routes/comment/list/list-comments.presenter.ts
import { ListCommentsOutput } from '@/usecases/comment/list/list-comments.usecase';
import { ListCommentsResponse } from './list-comments.dto';
import { CommentTarget } from '@/domain/entities/comment/comment.entity';

export class ListCommentsPresenter {
  public static toHttp(output: ListCommentsOutput, targetId: string, targetType: CommentTarget): ListCommentsResponse {
    return {
      comments: output.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        isEdited: comment.isEdited,
        isDeleted: comment.isDeleted,
        authorId: comment.authorId,
        author: {
          id: comment.author.id,
          name: comment.author.name,
          email: comment.author.email,
          avatar: comment.author.avatar,
        },
        parentId: comment.parentId,
        repliesCount: comment.repliesCount,
        approved: comment.approved,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        canEdit: comment.canEdit,
        canDelete: comment.canDelete,
        replies: comment.replies,
      })),
      pagination: output.pagination,
      targetInfo: {
        targetId,
        targetType,
        totalComments: output.pagination.total,
      },
    };
  }
}

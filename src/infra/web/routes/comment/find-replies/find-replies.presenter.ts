// src/infra/web/routes/comment/find-replies/find-replies.presenter.ts
import { FindRepliesOutput } from '@/usecases/comment/find-replies/find-replies.usecase';
import { FindRepliesResponse } from './find-replies.dto';

export class FindRepliesPresenter {
  public static toHttp(output: FindRepliesOutput): FindRepliesResponse {
    return {
      replies: output.replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        isEdited: reply.isEdited,
        isDeleted: reply.isDeleted,
        authorId: reply.authorId,
        author: {
          id: reply.author.id,
          name: reply.author.name,
          email: reply.author.email,
          avatar: reply.author.avatar,
        },
        parentId: reply.parentId,
        approved: reply.approved,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        canEdit: reply.canEdit,
        canDelete: reply.canDelete,
      })),
      pagination: output.pagination,
      parentComment: output.parentComment,
    };
  }
}
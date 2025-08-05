// src/infra/web/routes/comment/delete/delete-comment.dto.ts
export type DeleteCommentResponse = {
  id: string;
  isDeleted: boolean;
  updatedAt: Date;
  message: string;
};
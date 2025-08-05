// src/infra/web/routes/comment/update/update-comment.dto.ts
export type UpdateCommentRequest = {
  content: string;
};

export type UpdateCommentResponse = {
  id: string;
  content: string;
  isEdited: boolean;
  updatedAt: Date;
  message: string;
};
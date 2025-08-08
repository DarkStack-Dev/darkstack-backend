// src/infra/web/routes/comment/moderate/approve-comment.dto.ts
export type ApproveCommentResponse = {
  id: string;
  approved: boolean;
  approvedAt: Date;
  approvedBy: string;
  message: string;
};
// src/infra/web/routes/comment/moderate/reject-comment.dto.ts
export type RejectCommentRequest = {
  reason: string;
};

export type RejectCommentResponse = {
  id: string;
  approved: boolean;
  rejectedAt: Date;
  rejectedBy: string;
  rejectionReason: string;
  message: string;
};
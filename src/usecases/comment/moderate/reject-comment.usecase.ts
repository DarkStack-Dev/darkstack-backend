// src/usecases/comment/moderate/reject-comment.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { CommentGatewayRepository } from '@/domain/repositories/comment/comment.gateway.repository';
import { NotificationGateway } from '@/infra/websocket/notification.gateway';
import { CommentNotFoundUsecaseException } from '@/usecases/exceptions/comment/comment-not-found.usecase.exception';

export type RejectCommentInput = {
  commentId: string;
  moderatorId: string;
  reason: string;
};

export type RejectCommentOutput = {
  id: string;
  approved: boolean;
  rejectedAt: Date;
  rejectedBy: string;
  rejectionReason: string;
};

@Injectable()
export class RejectCommentUsecase implements Usecase<RejectCommentInput, RejectCommentOutput> {
  constructor(
    private readonly commentRepository: CommentGatewayRepository,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async execute(input: RejectCommentInput): Promise<RejectCommentOutput> {
    // Buscar comentário
    const comment = await this.commentRepository.findById(input.commentId);
    if (!comment) {
      throw new CommentNotFoundUsecaseException(
        `Comment not found with id ${input.commentId}`,
        'Comentário não encontrado',
        RejectCommentUsecase.name,
      );
    }

    // Rejeitar comentário (usa método da entidade)
    comment.reject(input.moderatorId, input.reason);

    // Persistir mudanças
    await this.commentRepository.update(comment);

    // Notificar autor do comentário rejeitado
    await this.notificationGateway.notifyUser(comment.getAuthorId(), {
      type: 'COMMENT_REJECTED',
      title: 'Comentário rejeitado',
      message: `Seu comentário foi rejeitado: ${input.reason}`,
      data: {
        commentId: comment.getId(),
        targetId: comment.getTargetId(),
        targetType: comment.getTargetType(),
        rejectionReason: input.reason,
      },
    });

    return {
      id: comment.getId(),
      approved: comment.getApproved(),
      rejectedAt: comment.getApprovedAt()!,
      rejectedBy: comment.getApprovedById()!,
      rejectionReason: comment.getRejectionReason()!,
    };
  }
}
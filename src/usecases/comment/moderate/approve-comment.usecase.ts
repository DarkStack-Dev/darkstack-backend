// src/usecases/comment/moderate/approve-comment.usecase.ts - CORRIGIDO
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { CommentGatewayRepository } from '@/domain/repositories/comment/comment.gateway.repository';
import { NotificationGateway } from '@/infra/websocket/notification.gateway';
import { CommentNotFoundUsecaseException } from '@/usecases/exceptions/comment/comment-not-found.usecase.exception';

export type ApproveCommentInput = {
  commentId: string;
  moderatorId: string;
};

export type ApproveCommentOutput = {
  id: string;
  approved: boolean;
  approvedAt: Date;
  approvedBy: string;
};

@Injectable()
export class ApproveCommentUsecase implements Usecase<ApproveCommentInput, ApproveCommentOutput> {
  constructor(
    private readonly commentRepository: CommentGatewayRepository,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async execute(input: ApproveCommentInput): Promise<ApproveCommentOutput> {
    // Buscar comentário
    const comment = await this.commentRepository.findById(input.commentId);
    if (!comment) {
      throw new CommentNotFoundUsecaseException(
        `Comment not found with id ${input.commentId}`,
        'Comentário não encontrado',
        ApproveCommentUsecase.name,
      );
    }

    // Aprovar comentário (usa método da entidade)
    comment.approve(input.moderatorId);

    // Persistir mudanças
    await this.commentRepository.update(comment);

    // Atualizar contadores
    await this.commentRepository.updateTargetCommentsCount(
      comment.getTargetId(),
      comment.getTargetType()
    );

    // ✅ CORRIGIDO: Verificar se parentId existe antes de usar
    const parentId = comment.getParentId();
    if (parentId) {
      await this.commentRepository.incrementRepliesCount(parentId);
    }

    // ✅ CORRIGIDO: Usar método correto do NotificationGateway
    try {
      this.notificationGateway.notifyUser(comment.getAuthorId(), {
        type: 'COMMENT_APPROVED',
        title: 'Comentário aprovado',
        message: 'Seu comentário foi aprovado e está visível',
        data: {
          commentId: comment.getId(),
          targetId: comment.getTargetId(),
          targetType: comment.getTargetType(),
        },
      });

      // 🚀 BROADCAST EM TEMPO REAL - Comentário aprovado aparece para todos
      this.notificationGateway.broadcastCommentUpdate({
        id: comment.getId(),
        approved: true,
        approvedAt: comment.getApprovedAt(),
        moderatedBy: input.moderatorId,
      });

    } catch (error) {
      console.error('Error sending approval notification:', error);
      // Não falhar o use case por erro de notificação
    }

    return {
      id: comment.getId(),
      approved: comment.getApproved(),
      approvedAt: comment.getApprovedAt()!,
      approvedBy: comment.getApprovedById()!,
    };
  }
}
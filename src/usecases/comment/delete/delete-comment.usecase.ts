// src/usecases/comment/delete/delete-comment.usecase.ts - CORRIGIDO
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { DeleteCommentUseCase as DomainDeleteCommentUseCase } from '@/domain/usecases/comment/delete/delete-comment.usecase';
import { NotificationGateway } from '@/infra/websocket/notification.gateway';
import { CommentNotFoundUsecaseException } from '@/usecases/exceptions/comment/comment-not-found.usecase.exception';
import { UserNotFoundUsecaseException } from '@/usecases/exceptions/user/user-not-found.usecase.exception';
import { InvalidInputUsecaseException } from '@/usecases/exceptions/input/invalid-input.usecase.exception';

export type DeleteCommentInput = {
  commentId: string;
  userId: string;
};

export type DeleteCommentOutput = {
  id: string;
  isDeleted: boolean;
  updatedAt: Date;
  realTimeBroadcast: boolean; // ✅ NOVO: Indica se foi enviado via WebSocket
};

@Injectable()
export class DeleteCommentUsecase implements Usecase<DeleteCommentInput, DeleteCommentOutput> {
  constructor(
    private readonly domainDeleteCommentUseCase: DomainDeleteCommentUseCase,
    private readonly notificationGateway: NotificationGateway, // ✅ CORRIGIDO: Usar NotificationGateway
  ) {}

  async execute(input: DeleteCommentInput): Promise<DeleteCommentOutput> {
    try {
      // 1. Delegar para Domain Use Case
      const output = await this.domainDeleteCommentUseCase.execute(input);

      // 2. ✅ CORRIGIDO: Broadcast deletion via WebSocket
      const realTimeBroadcast = await this.broadcastCommentDeletion(output);

      return {
        ...output,
        realTimeBroadcast,
      };

    } catch (error) {
      this.handleDomainExceptions(error);
      throw error;
    }
  }

  private async broadcastCommentDeletion(output: DeleteCommentOutput): Promise<boolean> {
    try {
      // 🚀 BROADCAST VIA WEBSOCKET - Comentário deletado em tempo real
      const broadcastCount = this.notificationGateway.broadcastCommentDelete(output.id);

      console.log(`✅ [DeleteCommentUsecase] Broadcast comment deletion to ${broadcastCount} connections`);
      return broadcastCount > 0;

    } catch (error) {
      console.error('❌ [DeleteCommentUsecase] Error broadcasting comment deletion:', error);
      return false;
    }
  }

  private handleDomainExceptions(error: any): void {
    if (error instanceof CommentNotFoundUsecaseException) {
      throw new CommentNotFoundUsecaseException(
        error.getInternalMessage?.() || `Comment not found in ${DeleteCommentUsecase.name}`,
        error.getExternalMessage?.() || 'Comentário não encontrado',
        DeleteCommentUsecase.name,
      );
    }

    if (error instanceof UserNotFoundUsecaseException) {
      throw new UserNotFoundUsecaseException(
        error.getInternalMessage?.() || `User not found in ${DeleteCommentUsecase.name}`,
        error.getExternalMessage?.() || 'Usuário não encontrado',
        DeleteCommentUsecase.name,
      );
    }

    if (error instanceof InvalidInputUsecaseException) {
      throw new InvalidInputUsecaseException(
        error.getInternalMessage?.() || `Invalid input in ${DeleteCommentUsecase.name}`,
        error.getExternalMessage?.() || 'Dados inválidos',
        DeleteCommentUsecase.name,
      );
    }
  }
}
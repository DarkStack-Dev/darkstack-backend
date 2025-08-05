// src/usecases/comment/update/update-comment.usecase.ts - CORRIGIDO
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { UpdateCommentUseCase as DomainUpdateCommentUseCase } from '@/domain/usecases/comment/update/update-comment.usecase';
import { NotificationGateway } from '@/infra/websocket/notification.gateway';
import { CommentNotFoundUsecaseException } from '@/usecases/exceptions/comment/comment-not-found.usecase.exception';
import { InvalidInputUsecaseException } from '@/usecases/exceptions/input/invalid-input.usecase.exception';

export type UpdateCommentInput = {
  commentId: string;
  content: string;
  userId: string;
};

export type UpdateCommentOutput = {
  id: string;
  content: string;
  isEdited: boolean;
  updatedAt: Date;
  realTimeBroadcast: boolean; // ✅ Propriedade da Application layer
};

@Injectable()
export class UpdateCommentUsecase implements Usecase<UpdateCommentInput, UpdateCommentOutput> {
  constructor(
    private readonly domainUpdateCommentUseCase: DomainUpdateCommentUseCase,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async execute(input: UpdateCommentInput): Promise<UpdateCommentOutput> {
    try {
      // 1. Delegar para Domain Use Case
      const domainOutput = await this.domainUpdateCommentUseCase.execute(input);

      // 2. ✅ CORRIGIDO: Broadcast update via WebSocket
      const realTimeBroadcast = await this.broadcastCommentUpdate(domainOutput);

      // 3. ✅ CORRIGIDO: Mapear campos explicitamente
      return {
        id: domainOutput.id,
        content: domainOutput.content,
        isEdited: domainOutput.isEdited,
        updatedAt: domainOutput.updatedAt,
        realTimeBroadcast, // ✅ Valor calculado na Application layer
      };

    } catch (error) {
      this.handleDomainExceptions(error);
      throw error;
    }
  }

  private async broadcastCommentUpdate(domainOutput: { id: string; content: string; isEdited: boolean; updatedAt: Date }): Promise<boolean> {
    try {
      const updateData = {
        commentId: domainOutput.id,
        content: domainOutput.content,
        isEdited: domainOutput.isEdited,
        updatedAt: domainOutput.updatedAt,
      };

      // 🚀 BROADCAST VIA WEBSOCKET - Comentário atualizado em tempo real
      const broadcastCount = this.notificationGateway.broadcastCommentUpdate(updateData);

      console.log(`✅ [UpdateCommentUsecase] Broadcast comment update to ${broadcastCount} connections`);
      return broadcastCount > 0;

    } catch (error) {
      console.error('❌ [UpdateCommentUsecase] Error broadcasting comment update:', error);
      return false;
    }
  }

  private handleDomainExceptions(error: any): void {
    if (error instanceof CommentNotFoundUsecaseException) {
      throw new CommentNotFoundUsecaseException(
        error.getInternalMessage?.() || `Comment not found in ${UpdateCommentUsecase.name}`,
        error.getExternalMessage?.() || 'Comentário não encontrado',
        UpdateCommentUsecase.name,
      );
    }

    if (error instanceof InvalidInputUsecaseException) {
      throw new InvalidInputUsecaseException(
        error.getInternalMessage?.() || `Invalid input in ${UpdateCommentUsecase.name}`,
        error.getExternalMessage?.() || 'Dados inválidos',
        UpdateCommentUsecase.name,
      );
    }
  }
}
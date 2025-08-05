// src/usecases/comment/update/update-comment.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { UpdateCommentUseCase as DomainUpdateCommentUseCase } from '@/domain/usecases/comment/update/update-comment.usecase';
import { NotificationStreamService } from '@/infra/services/notification/notification-stream.service';
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
};

@Injectable()
export class UpdateCommentUsecase implements Usecase<UpdateCommentInput, UpdateCommentOutput> {
  constructor(
    private readonly domainUpdateCommentUseCase: DomainUpdateCommentUseCase,
    private readonly notificationStreamService: NotificationStreamService,
  ) {}

  async execute(input: UpdateCommentInput): Promise<UpdateCommentOutput> {
    try {
      // 1. Delegar para Domain Use Case
      const output = await this.domainUpdateCommentUseCase.execute(input);

      // 2. Broadcast update via SSE
      await this.broadcastCommentUpdate(output);

      return output;

    } catch (error) {
      this.handleDomainExceptions(error);
      throw error;
    }
  }

  private async broadcastCommentUpdate(output: UpdateCommentOutput): Promise<void> {
    try {
      const streamData = {
        type: 'COMMENT_UPDATED',
        data: {
          commentId: output.id,
          content: output.content,
          isEdited: output.isEdited,
          updatedAt: output.updatedAt,
        },
      };

      await this.notificationStreamService.broadcast(streamData);
    } catch (error) {
      console.error('Error broadcasting comment update:', error);
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

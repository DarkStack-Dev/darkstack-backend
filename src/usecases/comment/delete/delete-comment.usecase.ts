// src/usecases/comment/delete/delete-comment.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { DeleteCommentUseCase as DomainDeleteCommentUseCase } from '@/domain/usecases/comment/delete/delete-comment.usecase';
import { NotificationStreamService } from '@/infra/services/notification/notification-stream.service';
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
};

@Injectable()
export class DeleteCommentUsecase implements Usecase<DeleteCommentInput, DeleteCommentOutput> {
  constructor(
    private readonly domainDeleteCommentUseCase: DomainDeleteCommentUseCase,
    private readonly notificationStreamService: NotificationStreamService,
  ) {}

  async execute(input: DeleteCommentInput): Promise<DeleteCommentOutput> {
    try {
      // 1. Delegar para Domain Use Case
      const output = await this.domainDeleteCommentUseCase.execute(input);

      // 2. Broadcast deletion via SSE
      await this.broadcastCommentDeletion(output);

      return output;

    } catch (error) {
      this.handleDomainExceptions(error);
      throw error;
    }
  }

  private async broadcastCommentDeletion(output: DeleteCommentOutput): Promise<void> {
    try {
      const streamData = {
        type: 'COMMENT_DELETED',
        data: {
          commentId: output.id,
          isDeleted: output.isDeleted,
          updatedAt: output.updatedAt,
        },
      };

      await this.notificationStreamService.broadcast(streamData);
    } catch (error) {
      console.error('Error broadcasting comment deletion:', error);
    }
  }

  private handleDomainExceptions(error: any): void {
    if (error instanceof CommentNotFoundUsecaseException) {
      throw new CommentNotFoundUsecaseException(
        error.internalMessage || `Comment not found in ${DeleteCommentUsecase.name}`,
        error.externalMessage || 'Comentário não encontrado',
        DeleteCommentUsecase.name,
      );
    }

    if (error instanceof UserNotFoundUsecaseException) {
      throw new UserNotFoundUsecaseException(
        error.internalMessage || `User not found in ${DeleteCommentUsecase.name}`,
        error.externalMessage || 'Usuário não encontrado',
        DeleteCommentUsecase.name,
      );
    }

    if (error instanceof InvalidInputUsecaseException) {
      throw new InvalidInputUsecaseException(
        error.internalMessage || `Invalid input in ${DeleteCommentUsecase.name}`,
        error.externalMessage || 'Dados inválidos',
        DeleteCommentUsecase.name,
      );
    }
  }
}
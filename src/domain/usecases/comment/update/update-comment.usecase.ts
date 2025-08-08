// src/domain/usecases/comment/update/update-comment.usecase.ts
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { CommentGatewayRepository } from '@/domain/repositories/comment/comment.gateway.repository';
import { CommentNotFoundUsecaseException } from '../../exceptions/comment/comment-not-found.usecase.exception';
import { InvalidInputUsecaseException } from '../../exceptions/input/invalid-input.usecase.exception';

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
export class UpdateCommentUseCase implements UseCase<UpdateCommentInput, UpdateCommentOutput> {
  constructor(
    private readonly commentRepository: CommentGatewayRepository,
  ) {}

  async execute(input: UpdateCommentInput): Promise<UpdateCommentOutput> {
    // 1. Buscar comentário
    const comment = await this.commentRepository.findById(input.commentId);
    if (!comment) {
      throw new CommentNotFoundUsecaseException(
        `Comment not found with id ${input.commentId}`,
        'Comentário não encontrado',
        UpdateCommentUseCase.name,
      );
    }

    // 2. Verificar permissões
    if (!comment.canBeEditedBy(input.userId)) {
      throw new InvalidInputUsecaseException(
        'User cannot edit this comment',
        'Usuário não pode editar este comentário',
        UpdateCommentUseCase.name,
      );
    }

    // 3. Validar conteúdo
    if (!input.content || input.content.trim().length < 3) {
      throw new InvalidInputUsecaseException(
        'Comment content must be at least 3 characters',
        'Comentário deve ter pelo menos 3 caracteres',
        UpdateCommentUseCase.name,
      );
    }

    if (input.content.trim().length > 2000) {
      throw new InvalidInputUsecaseException(
        'Comment content must be at most 2000 characters',
        'Comentário deve ter no máximo 2000 caracteres',
        UpdateCommentUseCase.name,
      );
    }

    // 4. Editar comentário
    comment.edit(input.content);

    // 5. Persistir mudanças
    await this.commentRepository.update(comment);

    return {
      id: comment.getId(),
      content: comment.getContent(),
      isEdited: comment.getIsEdited(),
      updatedAt: comment.getUpdatedAt(),
    };
  }
}

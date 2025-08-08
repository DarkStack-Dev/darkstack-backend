// src/domain/usecases/comment/delete/delete-comment.usecase.ts - CORRIGIDO
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { CommentGatewayRepository } from '@/domain/repositories/comment/comment.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { CommentNotFoundUsecaseException } from '../../exceptions/comment/comment-not-found.usecase.exception';
import { UserNotFoundUsecaseException } from '../../exceptions/user/user-not-found.usecase.exception';
import { InvalidInputUsecaseException } from '../../exceptions/input/invalid-input.usecase.exception';

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
export class DeleteCommentUseCase implements UseCase<DeleteCommentInput, DeleteCommentOutput> {
  constructor(
    private readonly commentRepository: CommentGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
  ) {}

  async execute(input: DeleteCommentInput): Promise<DeleteCommentOutput> {
    // 1. Buscar comentário
    const comment = await this.commentRepository.findById(input.commentId);
    if (!comment) {
      throw new CommentNotFoundUsecaseException(
        `Comment not found with id ${input.commentId}`,
        'Comentário não encontrado',
        DeleteCommentUseCase.name,
      );
    }

    // 2. Buscar usuário para verificar roles
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new UserNotFoundUsecaseException(
        `User not found with id ${input.userId}`,
        'Usuário não encontrado',
        DeleteCommentUseCase.name,
      );
    }

    // 3. ✅ CORRIGIDO: Verificar permissões usando getRoles()
    if (!comment.canBeDeletedBy(input.userId, user.getRoles())) {
      throw new InvalidInputUsecaseException(
        'User cannot delete this comment',
        'Usuário não pode deletar este comentário',
        DeleteCommentUseCase.name,
      );
    }

    // 4. Soft delete do comentário
    comment.softDelete();

    // 5. Persistir mudanças
    await this.commentRepository.update(comment);

    // 6. Atualizar contadores
    await this.commentRepository.updateTargetCommentsCount(
      comment.getTargetId(),
      comment.getTargetType()
    );

    // Se é resposta, decrementar contador do pai
    const parentId = comment.getParentId();
    if (parentId) {
      await this.commentRepository.decrementRepliesCount(parentId);
    }

    return {
      id: comment.getId(),
      isDeleted: comment.getIsDeleted(),
      updatedAt: comment.getUpdatedAt(),
    };
  }
}
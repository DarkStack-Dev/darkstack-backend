// src/domain/usecases/comment/create/create-comment.usecase.ts
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { Comment, CommentTarget } from '@/domain/entities/comment/comment.entity';
import { CommentGatewayRepository } from '@/domain/repositories/comment/comment.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { ArticleGatewayRepository } from '@/domain/repositories/article/article.gateway.repository';
import { ProjectsGatewayRepository } from '@/domain/repositories/projects/projects.gateway.repository';
import { UserNotFoundUsecaseException } from '../../exceptions/user/user-not-found.usecase.exception';
import { InvalidInputUsecaseException } from '../../exceptions/input/invalid-input.usecase.exception';
import { CommentNotFoundUsecaseException } from '../../exceptions/comment/comment-not-found.usecase.exception';

export type CreateCommentInput = {
  content: string;
  authorId: string;
  targetId: string;
  targetType: CommentTarget;
  parentId?: string;
};

export type CreateCommentOutput = {
  id: string;
  content: string;
  authorId: string;
  targetId: string;
  targetType: CommentTarget;
  parentId?: string;
  approved: boolean;
  createdAt: Date;
};

@Injectable()
export class CreateCommentUseCase implements UseCase<CreateCommentInput, CreateCommentOutput> {
  constructor(
    private readonly commentRepository: CommentGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
    private readonly articleRepository: ArticleGatewayRepository,
    private readonly projectsRepository: ProjectsGatewayRepository,
  ) {}

  async execute(input: CreateCommentInput): Promise<CreateCommentOutput> {
    // 1. Validar entrada
    this.validateInput(input);

    // 2. Verificar se autor existe
    const author = await this.userRepository.findById(input.authorId);
    if (!author) {
      throw new UserNotFoundUsecaseException(
        `Author not found with id ${input.authorId}`,
        'Usuário não encontrado',
        CreateCommentUseCase.name,
      );
    }

    // 3. Verificar se usuário pode comentar
    if (author.getRole() === 'BANNED') {
      throw new InvalidInputUsecaseException(
        'Banned users cannot create comments',
        'Usuários banidos não podem comentar',
        CreateCommentUseCase.name,
      );
    }

    // 4. Verificar se a entidade alvo existe e está disponível para comentários
    await this.validateTarget(input.targetId, input.targetType);

    // 5. Se é resposta, verificar se comentário pai existe
    if (input.parentId) {
      await this.validateParentComment(input.parentId, input.targetId, input.targetType);
    }

    // 6. Determinar se precisa de moderação
    const needsModeration = this.needsModeration(author.getRole(), input.content);

    // 7. Criar entidade do comentário
    const comment = Comment.create({
      content: input.content,
      authorId: input.authorId,
      targetId: input.targetId,
      targetType: input.targetType,
      parentId: input.parentId,
      approved: !needsModeration,
    });

    // 8. Persistir comentário
    await this.commentRepository.create(comment);

    // 9. Atualizar contadores se aprovado
    if (comment.getApproved()) {
      // Incrementar contador da entidade alvo
      await this.commentRepository.updateTargetCommentsCount(input.targetId, input.targetType);

      // Se é resposta, incrementar contador do comentário pai
      if (input.parentId) {
        await this.commentRepository.incrementRepliesCount(input.parentId);
      }
    }

    return {
      id: comment.getId(),
      content: comment.getContent(),
      authorId: comment.getAuthorId(),
      targetId: comment.getTargetId(),
      targetType: comment.getTargetType(),
      parentId: comment.getParentId(),
      approved: comment.getApproved(),
      createdAt: comment.getCreatedAt(),
    };
  }

  private validateInput(input: CreateCommentInput): void {
    if (!input.content || input.content.trim().length < 3) {
      throw new InvalidInputUsecaseException(
        'Comment content must be at least 3 characters',
        'Comentário deve ter pelo menos 3 caracteres',
        CreateCommentUseCase.name,
      );
    }

    if (input.content.trim().length > 2000) {
      throw new InvalidInputUsecaseException(
        'Comment content must be at most 2000 characters',
        'Comentário deve ter no máximo 2000 caracteres',
        CreateCommentUseCase.name,
      );
    }

    if (!['ARTICLE', 'PROJECT', 'ISSUE', 'QA'].includes(input.targetType)) {
      throw new InvalidInputUsecaseException(
        'Invalid target type',
        'Tipo de comentário inválido',
        CreateCommentUseCase.name,
      );
    }
  }

  private async validateTarget(targetId: string, targetType: CommentTarget): Promise<void> {
    switch (targetType) {
      case 'ARTICLE':
        const article = await this.articleRepository.findById(targetId);
        if (!article) {
          throw new InvalidInputUsecaseException(
            `Article not found with id ${targetId}`,
            'Artigo não encontrado',
            CreateCommentUseCase.name,
          );
        }
        if (article.getStatus() !== 'APPROVED') {
          throw new InvalidInputUsecaseException(
            'Cannot comment on non-approved article',
            'Não é possível comentar em artigo não aprovado',
            CreateCommentUseCase.name,
          );
        }
        break;

      case 'PROJECT':
        const project = await this.projectsRepository.findById(targetId);
        if (!project) {
          throw new InvalidInputUsecaseException(
            `Project not found with id ${targetId}`,
            'Projeto não encontrado',
            CreateCommentUseCase.name,
          );
        }
        break;

      // Adicionar outros tipos conforme necessário
      default:
        throw new InvalidInputUsecaseException(
          `Unsupported target type: ${targetType}`,
          'Tipo de comentário não suportado',
          CreateCommentUseCase.name,
        );
    }
  }

  private async validateParentComment(
    parentId: string,
    targetId: string,
    targetType: CommentTarget
  ): Promise<void> {
    const parentComment = await this.commentRepository.findById(parentId);
    if (!parentComment) {
      throw new CommentNotFoundUsecaseException(
        `Parent comment not found with id ${parentId}`,
        'Comentário pai não encontrado',
        CreateCommentUseCase.name,
      );
    }

    // Verificar se o comentário pai é da mesma entidade
    if (parentComment.getTargetId() !== targetId || parentComment.getTargetType() !== targetType) {
      throw new InvalidInputUsecaseException(
        'Parent comment must belong to the same target',
        'Comentário pai deve pertencer à mesma entidade',
        CreateCommentUseCase.name,
      );
    }

    // Verificar se comentário pai não foi deletado
    if (parentComment.getIsDeleted()) {
      throw new InvalidInputUsecaseException(
        'Cannot reply to deleted comment',
        'Não é possível responder a comentário deletado',
        CreateCommentUseCase.name,
      );
    }

    // Verificar se comentário pai foi aprovado
    if (!parentComment.getApproved()) {
      throw new InvalidInputUsecaseException(
        'Cannot reply to non-approved comment',
        'Não é possível responder a comentário não aprovado',
        CreateCommentUseCase.name,
      );
    }
  }

  private needsModeration(userRole: string, content: string): boolean {
    // Moderadores e admins não precisam de moderação
    if (['MODERATOR', 'ADMIN'].includes(userRole)) {
      return false;
    }

    // Verificar palavras suspeitas (exemplo simples)
    const suspiciousWords = ['spam', 'fake', 'scam'];
    const lowerContent = content.toLowerCase();
    
    return suspiciousWords.some(word => lowerContent.includes(word));
  }
}
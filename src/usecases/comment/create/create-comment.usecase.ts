// src/usecases/comment/create/create-comment.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { CreateCommentUseCase as DomainCreateCommentUseCase } from '@/domain/usecases/comment/create/create-comment.usecase';
import { NotificationGateway } from '@/infra/websocket/notification.gateway';
import { NotificationStreamService } from '@/infra/services/notification/notification-stream.service';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { ArticleGatewayRepository } from '@/domain/repositories/article/article.gateway.repository';
import { ProjectsGatewayRepository } from '@/domain/repositories/projects/projects.gateway.repository';
import { CommentNotFoundUsecaseException } from '@/usecases/exceptions/comment/comment-not-found.usecase.exception';
import { UserNotFoundUsecaseException } from '@/usecases/exceptions/user/user-not-found.usecase.exception';
import { InvalidInputUsecaseException } from '@/usecases/exceptions/input/invalid-input.usecase.exception';
import { CommentTarget } from '@/domain/entities/comment/comment.entity';

export type CreateCommentInput = {
  content: string;
  userId: string;
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
  needsModeration?: boolean;
};

@Injectable()
export class CreateCommentUsecase implements Usecase<CreateCommentInput, CreateCommentOutput> {
  constructor(
    private readonly domainCreateCommentUseCase: DomainCreateCommentUseCase,
    private readonly notificationGateway: NotificationGateway,
    private readonly notificationStreamService: NotificationStreamService,
    private readonly userRepository: UserGatewayRepository,
    private readonly articleRepository: ArticleGatewayRepository,
    private readonly projectsRepository: ProjectsGatewayRepository,
  ) {}

  async execute(input: CreateCommentInput): Promise<CreateCommentOutput> {
    try {
      // 1. Delegar para Domain Use Case (REGRA FUNDAMENTAL)
      const output = await this.domainCreateCommentUseCase.execute({
        content: input.content,
        authorId: input.userId,
        targetId: input.targetId,
        targetType: input.targetType,
        parentId: input.parentId,
      });

      // 2. Ações de infraestrutura (WebSocket, SSE, notificações)
      if (output.approved) {
        await this.handleApprovedComment(output, input);
      } else {
        await this.handleModerationRequired(output);
      }

      return {
        ...output,
        needsModeration: !output.approved,
      };

    } catch (error) {
      // 3. Mapear exceptions do domínio para aplicação
      this.handleDomainExceptions(error);
      throw error;
    }
  }

  private async handleApprovedComment(
    output: CreateCommentOutput,
    input: CreateCommentInput
  ): Promise<void> {
    // 🔔 Notificar entidade alvo via WebSocket
    await this.notifyTargetOwner(output, input);

    // 🔔 Se é resposta, notificar autor do comentário pai
    if (input.parentId) {
      await this.notifyParentCommentAuthor(output, input.parentId);
    }

    // 📡 Broadcast via SSE para usuários visualizando a entidade
    await this.broadcastNewComment(output);
  }

  private async notifyTargetOwner(
    output: CreateCommentOutput,
    input: CreateCommentInput
  ): Promise<void> {
    try {
      let targetOwnerId: string | null = null;
      let targetTitle = '';

      // Buscar owner da entidade alvo
      switch (input.targetType) {
        case 'ARTICLE':
          const article = await this.articleRepository.findById(input.targetId);
          if (article) {
            targetOwnerId = article.getAuthorId();
            targetTitle = article.getTitle();
          }
          break;

        case 'PROJECT':
          const project = await this.projectsRepository.findById(input.targetId);
          if (project) {
            targetOwnerId = project.getOwnerId();
            targetTitle = project.getName();
          }
          break;
      }

      // Não notificar se o autor do comentário é o mesmo da entidade
      if (targetOwnerId && targetOwnerId !== input.userId) {
        // Buscar dados do autor do comentário
        const author = await this.userRepository.findById(input.userId);
        
        await this.notificationGateway.notifyUser(targetOwnerId, {
          type: 'NEW_COMMENT',
          title: 'Novo comentário',
          message: `${author?.getName() || 'Usuário'} comentou em "${targetTitle}"`,
          data: {
            commentId: output.id,
            targetId: input.targetId,
            targetType: input.targetType,
            authorName: author?.getName(),
            content: output.content.substring(0, 100) + (output.content.length > 100 ? '...' : ''),
          },
        });
      }
    } catch (error) {
      console.error('Error notifying target owner:', error);
      // Não falhar o use case por erro de notificação
    }
  }

  private async notifyParentCommentAuthor(
    output: CreateCommentOutput,
    parentId: string
  ): Promise<void> {
    try {
      const parentCommentRepo = this.domainCreateCommentUseCase['commentRepository'];
      const parentComment = await parentCommentRepo.findById(parentId);
      
      if (parentComment && parentComment.getAuthorId() !== output.authorId) {
        const replyAuthor = await this.userRepository.findById(output.authorId);
        
        await this.notificationGateway.notifyUser(parentComment.getAuthorId(), {
          type: 'COMMENT_REPLY',
          title: 'Nova resposta',
          message: `${replyAuthor?.getName() || 'Usuário'} respondeu ao seu comentário`,
          data: {
            commentId: output.id,
            parentCommentId: parentId,
            targetId: output.targetId,
            targetType: output.targetType,
            authorName: replyAuthor?.getName(),
            content: output.content.substring(0, 100) + (output.content.length > 100 ? '...' : ''),
          },
        });
      }
    } catch (error) {
      console.error('Error notifying parent comment author:', error);
    }
  }

  private async broadcastNewComment(output: CreateCommentOutput): Promise<void> {
    try {
      // Broadcast para todos visualizando a entidade
      const streamData = {
        type: 'NEW_COMMENT',
        data: {
          commentId: output.id,
          targetId: output.targetId,
          targetType: output.targetType,
          content: output.content,
          authorId: output.authorId,
          parentId: output.parentId,
          createdAt: output.createdAt,
        },
      };

      await this.notificationStreamService.broadcastToChannel(
        `${output.targetType.toLowerCase()}-${output.targetId}`,
        streamData
      );
    } catch (error) {
      console.error('Error broadcasting new comment:', error);
    }
  }

  private async handleModerationRequired(output: CreateCommentOutput): Promise<void> {
    try {
      // Notificar moderadores sobre comentário pendente
      await this.notificationGateway.notifyModerators({
        type: 'COMMENT_PENDING_MODERATION',
        title: 'Comentário aguardando moderação',
        message: `Novo comentário precisa ser moderado`,
        data: {
          commentId: output.id,
          targetId: output.targetId,
          targetType: output.targetType,
          content: output.content.substring(0, 100) + (output.content.length > 100 ? '...' : ''),
        },
      });
    } catch (error) {
      console.error('Error notifying moderators:', error);
    }
  }

  private handleDomainExceptions(error: any): void {
    // Mapear exceptions específicas do domínio para aplicação
    if (error instanceof UserNotFoundUsecaseException) {
      throw new UserNotFoundUsecaseException(
        error.internalMessage || `User not found in ${CreateCommentUsecase.name}`,
        error.externalMessage || 'Usuário não encontrado',
        CreateCommentUsecase.name,
      );
    }

    if (error instanceof InvalidInputUsecaseException) {
      throw new InvalidInputUsecaseException(
        error.internalMessage || `Invalid input in ${CreateCommentUsecase.name}`,
        error.externalMessage || 'Dados inválidos',
        CreateCommentUsecase.name,
      );
    }

    if (error instanceof CommentNotFoundUsecaseException) {
      throw new CommentNotFoundUsecaseException(
        error.internalMessage || `Comment not found in ${CreateCommentUsecase.name}`,
        error.externalMessage || 'Comentário não encontrado',
        CreateCommentUsecase.name,
      );
    }
  }
}
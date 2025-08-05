// src/usecases/comment/create/create-comment.usecase.ts - TIPOS CORRIGIDOS
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { 
  CreateCommentUseCase as DomainCreateCommentUseCase,
  CreateCommentOutput as DomainCreateCommentOutput // ✅ RENOMEADO
} from '@/domain/usecases/comment/create/create-comment.usecase';
import { NotificationGateway } from '@/infra/websocket/notification.gateway';
import { NotificationStreamService } from '@/infra/services/notification/notification-stream.service';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { ArticleGatewayRepository } from '@/domain/repositories/article/article.gateway.repository';
import { ProjectsGatewayRepository } from '@/domain/repositories/projects/projects.gateway.repository';
import { CommentGatewayRepository } from '@/domain/repositories/comment/comment.gateway.repository';
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

// ✅ APPLICATION OUTPUT - Com propriedades de infraestrutura
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
  realTimeBroadcast: boolean; // ✅ Propriedade da camada Application
  notificationsSent: number; // ✅ Propriedade da camada Application
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
    private readonly commentRepository: CommentGatewayRepository,
  ) {}

  async execute(input: CreateCommentInput): Promise<CreateCommentOutput> {
    try {
      // 1. Delegar para Domain Use Case (retorna DomainCreateCommentOutput)
      const domainOutput: DomainCreateCommentOutput = await this.domainCreateCommentUseCase.execute({
        content: input.content,
        authorId: input.userId,
        targetId: input.targetId,
        targetType: input.targetType,
        parentId: input.parentId,
      });

      // 2. Inicializar valores da camada Application
      let realTimeBroadcast = false;
      let notificationsSent = 0;

      // 3. Ações de WebSocket e notificações (se aprovado)
      if (domainOutput.approved) {
        const results = await this.handleApprovedComment(domainOutput, input);
        realTimeBroadcast = results.realTimeBroadcast;
        notificationsSent = results.notificationsSent;
      }

      // 4. ✅ MAPEAR Domain Output → Application Output
      return {
        id: domainOutput.id,
        content: domainOutput.content,
        authorId: domainOutput.authorId,
        targetId: domainOutput.targetId,
        targetType: domainOutput.targetType,
        parentId: domainOutput.parentId,
        approved: domainOutput.approved,
        createdAt: domainOutput.createdAt,
        needsModeration: !domainOutput.approved,
        realTimeBroadcast, // ✅ Valor calculado na Application layer
        notificationsSent, // ✅ Valor calculado na Application layer
      };

    } catch (error) {
      this.handleDomainExceptions(error);
      throw error;
    }
  }

  // ✅ MÉTODO CORRIGIDO - Recebe DomainCreateCommentOutput
  private async handleApprovedComment(
    domainOutput: DomainCreateCommentOutput, // ✅ Tipo correto
    input: CreateCommentInput
  ): Promise<{ realTimeBroadcast: boolean; notificationsSent: number }> {
    let realTimeBroadcast = false;
    let notificationsSent = 0;

    try {
      // 🚀 1. BROADCAST EM TEMPO REAL VIA WEBSOCKET
      realTimeBroadcast = await this.broadcastNewCommentRealTime(domainOutput, input);

      // 🔔 2. NOTIFICAR DONO DA ENTIDADE
      const targetOwnerNotified = await this.notifyTargetOwner(domainOutput, input);
      if (targetOwnerNotified) notificationsSent++;

      // 🔔 3. SE É RESPOSTA, NOTIFICAR AUTOR DO COMENTÁRIO PAI
      if (input.parentId) {
        const parentAuthorNotified = await this.notifyParentCommentAuthor(domainOutput, input.parentId);
        if (parentAuthorNotified) notificationsSent++;
      }

    } catch (error) {
      console.error('Error in post-comment actions:', error);
    }

    return { realTimeBroadcast, notificationsSent };
  }

  private async broadcastNewCommentRealTime(
    domainOutput: DomainCreateCommentOutput, // ✅ Tipo correto
    input: CreateCommentInput
  ): Promise<boolean> {
    try {
      // Buscar dados do autor para incluir no broadcast
      const author = await this.userRepository.findById(input.userId);
      
      const commentData = {
        id: domainOutput.id,
        content: domainOutput.content,
        authorId: domainOutput.authorId,
        author: author ? {
          id: author.getId(),
          name: author.getName(),
          email: author.getEmail(),
          avatar: author.getAvatar(),
        } : null,
        targetId: domainOutput.targetId,
        targetType: domainOutput.targetType,
        parentId: domainOutput.parentId,
        approved: domainOutput.approved,
        createdAt: domainOutput.createdAt,
        isEdited: false,
        isDeleted: false,
        repliesCount: 0,
      };

      // 🚀 BROADCAST VIA WEBSOCKET
      const webSocketBroadcast = this.notificationGateway.broadcastNewComment(
        input.targetType,
        input.targetId,
        commentData
      );

      // 📡 BROADCAST VIA SSE (fallback)
      this.notificationStreamService.broadcastToChannel(
        `${input.targetType.toLowerCase()}_${input.targetId}`,
        {
          type: 'NEW_COMMENT',
          comment: commentData,
        }
      );

      console.log(`✅ [CreateCommentUsecase] Real-time broadcast: WebSocket=${webSocketBroadcast} users`);
      return webSocketBroadcast > 0;

    } catch (error) {
      console.error('❌ [CreateCommentUsecase] Error broadcasting new comment:', error);
      return false;
    }
  }

  private async notifyTargetOwner(
    domainOutput: DomainCreateCommentOutput, // ✅ Tipo correto
    input: CreateCommentInput
  ): Promise<boolean> {
    try {
      let targetOwnerId: string | null = null;
      let targetTitle = '';

      // Buscar owner da entidade alvo
      switch (input.targetType) {
        case 'ARTICLE':
          const article = await this.articleRepository.findById(input.targetId);
          if (article) {
            targetOwnerId = article.getAuthorId();
            targetTitle = article.getTitulo();
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
        const author = await this.userRepository.findById(input.userId);
        
        const notified = this.notificationGateway.notifyUser(targetOwnerId, {
          type: 'NEW_COMMENT',
          title: 'Novo comentário',
          message: `${author?.getName() || 'Usuário'} comentou em "${targetTitle}"`,
          data: {
            commentId: domainOutput.id,
            targetId: input.targetId,
            targetType: input.targetType,
            authorName: author?.getName(),
            content: domainOutput.content.substring(0, 100) + (domainOutput.content.length > 100 ? '...' : ''),
            url: `/${input.targetType.toLowerCase()}s/${input.targetId}`,
          },
        });

        console.log(`✅ [CreateCommentUsecase] Notified target owner ${targetOwnerId}: ${notified}`);
        return notified;
      }

      return false;
    } catch (error) {
      console.error('❌ [CreateCommentUsecase] Error notifying target owner:', error);
      return false;
    }
  }

  private async notifyParentCommentAuthor(
    domainOutput: DomainCreateCommentOutput, // ✅ Tipo correto
    parentId: string
  ): Promise<boolean> {
    try {
      const parentComment = await this.commentRepository.findById(parentId);
      
      if (parentComment && parentComment.getAuthorId() !== domainOutput.authorId) {
        const replyAuthor = await this.userRepository.findById(domainOutput.authorId);
        
        const notified = this.notificationGateway.notifyUser(parentComment.getAuthorId(), {
          type: 'COMMENT_REPLY',
          title: 'Nova resposta',
          message: `${replyAuthor?.getName() || 'Usuário'} respondeu ao seu comentário`,
          data: {
            commentId: domainOutput.id,
            parentCommentId: parentId,
            targetId: domainOutput.targetId,
            targetType: domainOutput.targetType,
            authorName: replyAuthor?.getName(),
            content: domainOutput.content.substring(0, 100) + (domainOutput.content.length > 100 ? '...' : ''),
            url: `/${domainOutput.targetType.toLowerCase()}s/${domainOutput.targetId}#comment-${domainOutput.id}`,
          },
        });

        console.log(`✅ [CreateCommentUsecase] Notified parent author ${parentComment.getAuthorId()}: ${notified}`);
        return notified;
      }

      return false;
    } catch (error) {
      console.error('❌ [CreateCommentUsecase] Error notifying parent comment author:', error);
      return false;
    }
  }

  private handleDomainExceptions(error: any): void {
    if (error instanceof UserNotFoundUsecaseException) {
      throw new UserNotFoundUsecaseException(
        error.getInternalMessage?.() || `User not found in ${CreateCommentUsecase.name}`,
        error.getExternalMessage?.() || 'Usuário não encontrado',
        CreateCommentUsecase.name,
      );
    }

    if (error instanceof InvalidInputUsecaseException) {
      throw new InvalidInputUsecaseException(
        error.getInternalMessage?.() || `Invalid input in ${CreateCommentUsecase.name}`,
        error.getExternalMessage?.() || 'Dados inválidos',
        CreateCommentUsecase.name,
      );
    }

    if (error instanceof CommentNotFoundUsecaseException) {
      throw new CommentNotFoundUsecaseException(
        error.getInternalMessage?.() || `Comment not found in ${CreateCommentUsecase.name}`,
        error.getExternalMessage?.() || 'Comentário não encontrado',
        CreateCommentUsecase.name,
      );
    }
  }
}
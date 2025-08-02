// src/domain/usecases/article/approve/approve-article.usecase.ts - WEBSOCKET VERSION
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { ArticleGatewayRepository } from '@/domain/repositories/article/article.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { CreateNotificationUseCase } from '../../notification/create/create-notification.usecase';
import { ArticleNotFoundUsecaseException } from '../../exceptions/article/article-not-found.usecase.exception';
import { UserNotFoundUsecaseException } from '../../exceptions/user/user-not-found.usecase.exception';
import { InvalidInputUsecaseException } from '../../exceptions/input/invalid-input.usecase.exception';
import { ArticleStatus, NotificationType } from 'generated/prisma';

export type ApproveArticleInput = {
  articleId: string;
  moderatorId: string;
};

export type ApproveArticleOutput = {
  id: string;
  titulo: string;
  status: string;
  approvedAt: Date;
  authorNotified: boolean;
  realTimeNotificationSent: boolean;
};

@Injectable()
export class ApproveArticleUseCase implements UseCase<ApproveArticleInput, ApproveArticleOutput> {
  constructor(
    private readonly articleRepository: ArticleGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
    private readonly createNotificationUseCase: CreateNotificationUseCase,
  ) {}

  async execute({ articleId, moderatorId }: ApproveArticleInput): Promise<ApproveArticleOutput> {
    // Buscar artigo
    const article = await this.articleRepository.findById(articleId);
    if (!article) {
      throw new ArticleNotFoundUsecaseException(
        `Article not found with id ${articleId}`,
        'Artigo não encontrado',
        ApproveArticleUseCase.name,
      );
    }

    // Verificar se moderador existe
    const moderator = await this.userRepository.findById(moderatorId);
    if (!moderator) {
      throw new UserNotFoundUsecaseException(
        `Moderator not found with id ${moderatorId}`,
        'Moderador não encontrado',
        ApproveArticleUseCase.name,
      );
    }

    // Verificar se moderador tem permissão
    if (!moderator.isModerator() && !moderator.isAdmin()) {
      throw new InvalidInputUsecaseException(
        `User ${moderatorId} is not authorized to moderate articles`,
        'Você não tem permissão para moderar artigos',
        ApproveArticleUseCase.name,
      );
    }

    // Verificar se artigo está pendente
    if (!article.isPending()) {
      throw new InvalidInputUsecaseException(
        `Article ${articleId} is not pending moderation`,
        'Este artigo não está aguardando moderação',
        ApproveArticleUseCase.name,
      );
    }

    // Aprovar artigo
    const approvedArticle = article.moderate({
      status: ArticleStatus.APPROVED,
      approvedById: moderatorId,
    });

    await this.articleRepository.update(approvedArticle);

    // ✅ ENVIAR NOTIFICAÇÃO EM TEMPO REAL PARA O AUTOR VIA WEBSOCKET
    let authorNotified = false;
    let realTimeNotificationSent = false;
    
    try {
      const notificationResult = await this.createNotificationUseCase.execute({
        type: NotificationType.ARTICLE_APPROVED,
        title: '🎉 Artigo aprovado!',
        message: `Parabéns! Seu artigo "${approvedArticle.getTitulo()}" foi aprovado e já está disponível para leitura.`,
        userId: approvedArticle.getAuthorId(),
        relatedId: approvedArticle.getId(),
        relatedType: 'ARTICLE',
        createdById: moderatorId,
        metadata: {
          articleTitle: approvedArticle.getTitulo(),
          articleSlug: approvedArticle.getSlug(),
          moderatorName: moderator.getName(),
          action: 'view',
          url: `/articles/${approvedArticle.getSlug()}`,
          approvedAt: approvedArticle.getApprovedAt(),
        },
      });
      
      authorNotified = true;
      realTimeNotificationSent = notificationResult.realTimeSent;
      
      console.log(`✅ [ApproveArticleUseCase] Author ${approvedArticle.getAuthorId()} notified. Real-time: ${realTimeNotificationSent}`);
    } catch (error) {
      console.error(`❌ [ApproveArticleUseCase] Failed to send notification:`, error);
    }

    return {
      id: approvedArticle.getId(),
      titulo: approvedArticle.getTitulo(),
      status: approvedArticle.getStatus(),
      approvedAt: approvedArticle.getApprovedAt()!,
      authorNotified,
      realTimeNotificationSent,
    };
  }
}

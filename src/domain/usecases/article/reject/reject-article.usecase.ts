// src/domain/usecases/article/reject/reject-article.usecase.ts - WEBSOCKET VERSION
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { ArticleGatewayRepository } from '@/domain/repositories/article/article.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { CreateNotificationUseCase } from '../../notification/create/create-notification.usecase';
import { ArticleNotFoundUsecaseException } from '../../exceptions/article/article-not-found.usecase.exception';
import { UserNotFoundUsecaseException } from '../../exceptions/user/user-not-found.usecase.exception';
import { InvalidInputUsecaseException } from '../../exceptions/input/invalid-input.usecase.exception';
import { ArticleStatus, NotificationType } from 'generated/prisma';

export type RejectArticleInput = {
  articleId: string;
  moderatorId: string;
  rejectionReason: string;
};

export type RejectArticleOutput = {
  id: string;
  titulo: string;
  status: string;
  rejectionReason: string;
  authorNotified: boolean;
  realTimeNotificationSent: boolean;
};

@Injectable()
export class RejectArticleUseCase implements UseCase<RejectArticleInput, RejectArticleOutput> {
  constructor(
    private readonly articleRepository: ArticleGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
    private readonly createNotificationUseCase: CreateNotificationUseCase,
  ) {}

  async execute({ articleId, moderatorId, rejectionReason }: RejectArticleInput): Promise<RejectArticleOutput> {
    // Validar motivo de rejeição
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      throw new InvalidInputUsecaseException(
        'Rejection reason must be at least 10 characters',
        'Motivo da rejeição deve ter pelo menos 10 caracteres',
        RejectArticleUseCase.name,
      );
    }

    // Buscar artigo
    const article = await this.articleRepository.findById(articleId);
    if (!article) {
      throw new ArticleNotFoundUsecaseException(
        `Article not found with id ${articleId}`,
        'Artigo não encontrado',
        RejectArticleUseCase.name,
      );
    }

    // Verificar se moderador existe
    const moderator = await this.userRepository.findById(moderatorId);
    if (!moderator) {
      throw new UserNotFoundUsecaseException(
        `Moderator not found with id ${moderatorId}`,
        'Moderador não encontrado',
        RejectArticleUseCase.name,
      );
    }

    // Verificar se moderador tem permissão
    if (!moderator.isModerator() && !moderator.isAdmin()) {
      throw new InvalidInputUsecaseException(
        `User ${moderatorId} is not authorized to moderate articles`,
        'Você não tem permissão para moderar artigos',
        RejectArticleUseCase.name,
      );
    }

    // Verificar se artigo está pendente
    if (!article.isPending()) {
      throw new InvalidInputUsecaseException(
        `Article ${articleId} is not pending moderation`,
        'Este artigo não está aguardando moderação',
        RejectArticleUseCase.name,
      );
    }

    // Rejeitar artigo
    const rejectedArticle = article.moderate({
      status: ArticleStatus.REJECTED,
      rejectionReason: rejectionReason.trim(),
    });

    await this.articleRepository.update(rejectedArticle);

    // ✅ ENVIAR NOTIFICAÇÃO EM TEMPO REAL PARA O AUTOR VIA WEBSOCKET
    let authorNotified = false;
    let realTimeNotificationSent = false;
    
    try {
      const notificationResult = await this.createNotificationUseCase.execute({
        type: NotificationType.ARTICLE_REJECTED,
        title: '📝 Artigo necessita ajustes',
        message: `Seu artigo "${rejectedArticle.getTitulo()}" precisa de alguns ajustes antes da publicação.\n\n💡 Motivo: ${rejectionReason}\n\nVocê pode editar e reenviar quando estiver pronto.`,
        userId: rejectedArticle.getAuthorId(),
        relatedId: rejectedArticle.getId(),
        relatedType: 'ARTICLE',
        createdById: moderatorId,
        metadata: {
          articleTitle: rejectedArticle.getTitulo(),
          rejectionReason: rejectionReason,
          moderatorName: moderator.getName(),
          action: 'edit',
          url: `/articles/${rejectedArticle.getId()}/edit`,
          canResubmit: true,
        },
      });
      
      authorNotified = true;
      realTimeNotificationSent = notificationResult.realTimeSent;
      
      console.log(`✅ [RejectArticleUseCase] Author ${rejectedArticle.getAuthorId()} notified. Real-time: ${realTimeNotificationSent}`);
    } catch (error) {
      console.error(`❌ [RejectArticleUseCase] Failed to send notification:`, error);
    }

    return {
      id: rejectedArticle.getId(),
      titulo: rejectedArticle.getTitulo(),
      status: rejectedArticle.getStatus(),
      rejectionReason: rejectedArticle.getRejectionReason()!,
      authorNotified,
      realTimeNotificationSent,
    };
  }
}
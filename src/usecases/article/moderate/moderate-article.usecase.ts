// src/usecases/article/moderate/moderate-article.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { ArticleGatewayRepository } from '@/domain/repositories/article/article.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { ArticleNotFoundUsecaseException } from '@/usecases/exceptions/article/article-not-found.usecase.exception';
import { UserNotFoundUsecaseException } from '@/usecases/exceptions/user/user-not-found.usecase.exception';
import { InvalidInputUsecaseException } from '@/usecases/exceptions/input/invalid-input.usecase.exception';
import { ArticleStatus, UserRole } from 'generated/prisma';

export type ModerateArticleInput = {
  articleId: string;
  moderatorId: string;
  moderatorRoles: UserRole[];
  action: 'approve' | 'reject';
  rejectionReason?: string;
};

export type ModerateArticleOutput = {
  success: boolean;
  message: string;
  article: {
    id: string;
    titulo: string;
    status: ArticleStatus;
    author: {
      id: string;
      name: string;
      email: string;
    };
  };
  moderator: {
    id: string;
    name: string;
    email: string;
  };
  moderatedAt: Date;
};

@Injectable()
export class ModerateArticleUsecase implements Usecase<ModerateArticleInput, ModerateArticleOutput> {
  constructor(
    private readonly articleRepository: ArticleGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
  ) {}

  async execute({ articleId, moderatorId, moderatorRoles, action, rejectionReason }: ModerateArticleInput): Promise<ModerateArticleOutput> {
    // Verificar permissões do moderador
    this.checkModeratorPermissions(moderatorRoles);

    // Buscar moderador
    const moderator = await this.userRepository.findById(moderatorId);
    if (!moderator) {
      throw new UserNotFoundUsecaseException(
        `Moderator not found with id ${moderatorId}`,
        'Moderador não encontrado',
        ModerateArticleUsecase.name,
      );
    }

    // Buscar artigo
    const article = await this.articleRepository.findById(articleId);
    if (!article) {
      throw new ArticleNotFoundUsecaseException(
        `Article not found with id ${articleId}`,
        'Artigo não encontrado',
        ModerateArticleUsecase.name,
      );
    }

    // Verificar se artigo pode ser moderado
    if (!article.isPending()) {
      throw new InvalidInputUsecaseException(
        `Article ${articleId} is not pending moderation, current status: ${article.getStatus()}`,
        'Este artigo não está aguardando moderação',
        ModerateArticleUsecase.name,
      );
    }

    // Verificar se não é o próprio autor moderando
    if (article.getAuthorId() === moderatorId) {
      throw new InvalidInputUsecaseException(
        `Moderator ${moderatorId} cannot moderate their own article ${articleId}`,
        'Você não pode moderar seu próprio artigo',
        ModerateArticleUsecase.name,
      );
    }

    // Validar dados da moderação
    this.validateModerationData(action, rejectionReason);

    // Buscar autor do artigo
    const author = await this.userRepository.findById(article.getAuthorId());
    if (!author) {
      throw new UserNotFoundUsecaseException(
        `Article author not found with id ${article.getAuthorId()}`,
        'Autor do artigo não encontrado',
        ModerateArticleUsecase.name,
      );
    }

    // Aplicar moderação
    const newStatus = action === 'approve' ? ArticleStatus.APPROVED : ArticleStatus.REJECTED;
    const moderatedArticle = article.moderate({
      status: newStatus,
      approvedById: action === 'approve' ? moderatorId : undefined,
      rejectionReason: action === 'reject' ? rejectionReason : undefined,
    });

    // Persistir alterações
    await this.articleRepository.update(moderatedArticle);

    const moderatedAt = new Date();

    console.log(`✅ Artigo ${article.getTitulo()} ${action === 'approve' ? 'aprovado' : 'rejeitado'} por ${moderator.getName()}`);

    return {
      success: true,
      message: action === 'approve' 
        ? 'Artigo aprovado com sucesso!' 
        : 'Artigo rejeitado com sucesso!',
      article: {
        id: article.getId(),
        titulo: article.getTitulo(),
        status: newStatus,
        author: {
          id: author.getId(),
          name: author.getName(),
          email: author.getEmail(),
        },
      },
      moderator: {
        id: moderator.getId(),
        name: moderator.getName(),
        email: moderator.getEmail(),
      },
      moderatedAt,
    };
  }

  private checkModeratorPermissions(roles: UserRole[]): void {
    const isAdmin = roles.includes(UserRole.ADMIN);
    const isModerator = roles.includes(UserRole.MODERATOR);

    if (!isAdmin && !isModerator) {
      throw new InvalidInputUsecaseException(
        'User attempted to moderate article without proper permissions',
        'Apenas administradores e moderadores podem moderar artigos',
        ModerateArticleUsecase.name,
      );
    }
  }

  private validateModerationData(action: string, rejectionReason?: string): void {
    if (action !== 'approve' && action !== 'reject') {
      throw new InvalidInputUsecaseException(
        `Invalid moderation action: ${action}`,
        'Ação de moderação inválida',
        ModerateArticleUsecase.name,
      );
    }

    if (action === 'reject') {
      if (!rejectionReason || rejectionReason.trim().length === 0) {
        throw new InvalidInputUsecaseException(
          'Rejection reason is required when rejecting an article',
          'Motivo da rejeição é obrigatório',
          ModerateArticleUsecase.name,
        );
      }

      if (rejectionReason.length > 500) {
        throw new InvalidInputUsecaseException(
          'Rejection reason must not exceed 500 characters',
          'Motivo da rejeição não pode exceder 500 caracteres',
          ModerateArticleUsecase.name,
        );
      }
    }
  }
}
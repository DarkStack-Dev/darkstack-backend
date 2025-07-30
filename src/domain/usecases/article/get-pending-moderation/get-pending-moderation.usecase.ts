// src/domain/usecases/article/get-pending-moderation/get-pending-moderation.usecase.ts
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { ArticleGatewayRepository } from '@/domain/repositories/article/article.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { UserNotFoundUsecaseException } from '../../exceptions/user/user-not-found.usecase.exception';
import { InvalidInputUsecaseException } from '../../exceptions/input/invalid-input.usecase.exception';
import { UserRole } from 'generated/prisma';

export type GetPendingModerationInput = {
  moderatorId: string;
  moderatorRoles: UserRole[];
  includeOwn?: boolean;
};

export type GetPendingModerationOutput = {
  articles: Array<{
    id: string;
    titulo: string;
    slug: string;
    descricao: string;
    categoria: string;
    tags: string[];
    createdAt: Date;
    tempoLeituraMinutos?: number;
    author: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    mainImage?: {
      url: string;
      alt?: string;
    };
  }>;
  total: number;
  moderator: {
    id: string;
    name: string;
    email: string;
  };
};

@Injectable()
export class GetPendingModerationUseCase implements UseCase<GetPendingModerationInput, GetPendingModerationOutput> {
  constructor(
    private readonly articleRepository: ArticleGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
  ) {}

  async execute({ moderatorId, moderatorRoles, includeOwn = false }: GetPendingModerationInput): Promise<GetPendingModerationOutput> {
    // Verificar permissões do moderador
    this.checkModeratorPermissions(moderatorRoles);

    // Verificar se moderador existe
    const moderator = await this.userRepository.findById(moderatorId);
    if (!moderator) {
      throw new UserNotFoundUsecaseException(
        `Moderator not found with id ${moderatorId}`,
        'Moderador não encontrado',
        GetPendingModerationUseCase.name,
      );
    }

    console.log(`🔍 Buscando artigos pendentes para moderador ${moderator.getName()}`);

    // Buscar artigos pendentes
    const pendingArticles = await this.articleRepository.findForModeration(
      includeOwn ? undefined : moderatorId
    );

    // Buscar dados dos autores
    const authorIds = [...new Set(pendingArticles.map(article => article.getAuthorId()))];
    const authorsMap = new Map();
    
    for (const authorId of authorIds) {
      const author = await this.userRepository.findById(authorId);
      if (author) {
        authorsMap.set(authorId, {
          id: author.getId(),
          name: author.getName(),
          email: author.getEmail(),
          avatar: author.getAvatar(),
        });
      }
    }

    // Mapear artigos para output
    const articles = pendingArticles.map(article => {
      const author = authorsMap.get(article.getAuthorId()) || {
        id: article.getAuthorId(),
        name: 'Autor não encontrado',
        email: '',
        avatar: undefined,
      };

      const mainImage = article.getImages().find(img => img.isMain);

      return {
        id: article.getId(),
        titulo: article.getTitulo(),
        slug: article.getSlug(),
        descricao: article.getDescricao(),
        categoria: article.getCategoria(),
        tags: article.getTags(),
        createdAt: article.getCreatedAt(),
        tempoLeituraMinutos: article.getTempoLeituraMinutos(),
        author,
        ...(mainImage && {
          mainImage: {
            url: mainImage.url || '',
            alt: mainImage.alt,
          },
        }),
      };
    });

    console.log(`✅ Encontrados ${articles.length} artigos pendentes`);

    return {
      articles,
      total: articles.length,
      moderator: {
        id: moderator.getId(),
        name: moderator.getName(),
        email: moderator.getEmail(),
      },
    };
  }

  private checkModeratorPermissions(roles: UserRole[]): void {
    const isAdmin = roles.includes(UserRole.ADMIN);
    const isModerator = roles.includes(UserRole.MODERATOR);

    if (!isAdmin && !isModerator) {
      throw new InvalidInputUsecaseException(
        'User attempted to access pending moderation without proper permissions',
        'Apenas administradores e moderadores podem ver artigos pendentes',
        GetPendingModerationUseCase.name,
      );
    }
  }
}
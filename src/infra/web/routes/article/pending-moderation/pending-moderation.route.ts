// src/infra/web/routes/article/pending-moderation/pending-moderation.route.ts
import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { ArticleGatewayRepository } from '@/domain/repositories/article/article.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { Roles } from '@/infra/web/auth/decorators/roles.decorator';

export type PendingModerationResponse = {
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
};

@Controller('/articles')
export class PendingModerationRoute {
  constructor(
    private readonly articleRepository: ArticleGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
  ) {}

  @Get('/pending-moderation')
  @Roles('ADMIN', 'MODERATOR')
  public async handle(
    @Query('includeOwn') includeOwn: string,
    @Req() req: Request,
  ): Promise<PendingModerationResponse> {
    const moderatorId = req['userId'];
    const shouldIncludeOwn = includeOwn === 'true';

    console.log(`🔍 Buscando artigos pendentes para moderador ${moderatorId}`);

    const pendingArticles = await this.articleRepository.findForModeration(
      shouldIncludeOwn ? undefined : moderatorId
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
    };
  }
}
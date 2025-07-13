// src/usecases/article/get-pending-moderation/get-pending-moderation.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { ArticleGatewayRepository } from '@/domain/repositories/article/article.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { ArticleStatus } from 'generated/prisma';

export type GetPendingModerationInput = {
  moderatorId: string;
  moderatorRoles: string[];
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
    status: string;
    visualizacoes: number;
    tempoLeituraMinutos?: number;
    createdAt: Date;
    updatedAt: Date;
    author: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
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
export class GetPendingModerationUsecase implements Usecase<GetPendingModerationInput, GetPendingModerationOutput> {
  constructor(
    private readonly articleRepository: ArticleGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
  ) {}

  async execute({ moderatorId, moderatorRoles, includeOwn = false }: GetPendingModerationInput): Promise<GetPendingModerationOutput> {
    console.log(`[GetPendingModerationUsecase] Executando para moderador ${moderatorId}`, {
      roles: moderatorRoles,
      includeOwn,
    });

    // Buscar dados do moderador
    const moderator = await this.userRepository.findById(moderatorId);
    if (!moderator) {
      throw new Error(`Moderator not found with id ${moderatorId}`);
    }

    // 🔍 DEBUG: Buscar TODOS os artigos pendentes primeiro
    console.log('[DEBUG] Buscando todos os artigos pendentes...');
    const allPendingArticles = await this.articleRepository.findByStatus(ArticleStatus.PENDING);
    console.log(`[DEBUG] Total de artigos PENDING no banco: ${allPendingArticles.length}`);
    
    if (allPendingArticles.length > 0) {
      console.log('[DEBUG] Primeiros 3 artigos pendentes:', 
        allPendingArticles.slice(0, 3).map(a => ({
          id: a.getId(),
          titulo: a.getTitulo(),
          authorId: a.getAuthorId(),
          approvedById: a.getApprovedById(),
          status: a.getStatus(),
          isActive: a.getIsActivate(),
          deletedAt: a.getDeletedAt(),
        }))
      );
    }

    // Agora buscar artigos para moderação com filtros
    let articlesForModeration;
    
    if (includeOwn) {
      // Se incluir próprios artigos, buscar todos os pendentes
      articlesForModeration = allPendingArticles;
      console.log(`[DEBUG] Incluindo próprios artigos: ${articlesForModeration.length}`);
    } else {
      // Filtrar artigos que o moderador não criou
      articlesForModeration = allPendingArticles.filter(article => 
        article.getAuthorId() !== moderatorId
      );
      console.log(`[DEBUG] Excluindo próprios artigos: ${articlesForModeration.length}`);
    }

    // Mapear para output format
    const articlesOutput = await Promise.all(
      articlesForModeration.map(async (article) => {
        const author = await this.userRepository.findById(article.getAuthorId());
        
        return {
          id: article.getId(),
          titulo: article.getTitulo(),
          slug: article.getSlug(),
          descricao: article.getDescricao(),
          categoria: article.getCategoria(),
          tags: article.getTags(),
          status: article.getStatus(),
          visualizacoes: article.getVisualizacoes(),
          tempoLeituraMinutos: article.getTempoLeituraMinutos(),
          createdAt: article.getCreatedAt(),
          updatedAt: article.getUpdatedAt(),
          author: {
            id: author?.getId() || '',
            name: author?.getName() || 'Autor não encontrado',
            email: author?.getEmail() || '',
            avatar: author?.getAvatar(),
          },
        };
      })
    );

    console.log(`[GetPendingModerationUsecase] Retornando ${articlesOutput.length} artigos`);

    return {
      articles: articlesOutput,
      total: articlesOutput.length,
      moderator: {
        id: moderator.getId(),
        name: moderator.getName(),
        email: moderator.getEmail(),
      },
    };
  }
}
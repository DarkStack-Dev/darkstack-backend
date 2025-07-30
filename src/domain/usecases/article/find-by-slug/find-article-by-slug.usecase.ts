// src/domain/usecases/article/find-by-slug/find-article-by-slug.usecase.ts
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { ArticleGatewayRepository } from '@/domain/repositories/article/article.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { User } from '@/domain/entities/user/user.entitty';
import { InvalidInputUsecaseException } from '../../exceptions/input/invalid-input.usecase.exception';
import { ArticleStatus } from 'generated/prisma';

export type FindArticleBySlugInput = {
  slug: string;
  currentUserId?: string;
  includeContent?: boolean;
};

export type FindArticleBySlugOutput = {
  id: string;
  titulo: string;
  slug: string;
  descricao: string;
  conteudo?: string;
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
  approver?: {
    id: string;
    name: string;
    email: string;
  };
  approvedAt?: Date;
  rejectionReason?: string;
  images: Array<{
    id: string;
    filename: string;
    url: string;
    alt?: string;
    order: number;
    isMain: boolean;
  }>;
  isOwner: boolean;
  canEdit: boolean;
};

@Injectable()
export class FindArticleBySlugUseCase implements UseCase<FindArticleBySlugInput, FindArticleBySlugOutput> {
  constructor(
    private readonly articleRepository: ArticleGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
  ) {}

  async execute({ slug, currentUserId, includeContent = true }: FindArticleBySlugInput): Promise<FindArticleBySlugOutput> {
    // Buscar artigo pelo slug
    const article = await this.articleRepository.findBySlug(slug, includeContent);
    if (!article) {
      throw new InvalidInputUsecaseException(
        `Article not found with slug ${slug}`,
        'Artigo não encontrado',
        FindArticleBySlugUseCase.name,
      );
    }

    // Verificar se usuário pode ver o artigo
    const canView = this.canUserViewArticle(article, currentUserId);
    if (!canView) {
      throw new InvalidInputUsecaseException(
        `User ${currentUserId} cannot view article ${slug} with status ${article.getStatus()}`,
        'Você não tem permissão para ver este artigo',
        FindArticleBySlugUseCase.name,
      );
    }

    // Buscar dados do autor
    const author = await this.userRepository.findById(article.getAuthorId());
    if (!author) {
      throw new InvalidInputUsecaseException(
        `Author not found for article ${slug}`,
        'Autor do artigo não encontrado',
        FindArticleBySlugUseCase.name,
      );
    }

    // Buscar aprovador se existir
    let approver: User | null = null;
    if (article.getApprovedById()) {
      approver = await this.userRepository.findById(article.getApprovedById()!);
    }

    // Incrementar visualizações se for artigo público
    if (article.isPublished() && currentUserId !== article.getAuthorId()) {
      await this.articleRepository.incrementViews(article.getId());
    }

    const isOwner = currentUserId === article.getAuthorId();
    const canEdit = article.canBeEditedBy(currentUserId || '');

    return {
      id: article.getId(),
      titulo: article.getTitulo(),
      slug: article.getSlug(),
      descricao: article.getDescricao(),
      ...(includeContent && { conteudo: article.getConteudo() }),
      categoria: article.getCategoria(),
      tags: article.getTags(),
      status: article.getStatus(),
      visualizacoes: article.getVisualizacoes(),
      tempoLeituraMinutos: article.getTempoLeituraMinutos(),
      createdAt: article.getCreatedAt(),
      updatedAt: article.getUpdatedAt(),
      author: {
        id: author.getId(),
        name: author.getName(),
        email: author.getEmail(),
        avatar: author.getAvatar(),
      },
      ...(approver && {
        approver: {
          id: approver.getId(),
          name: approver.getName(),
          email: approver.getEmail(),
        },
      }),
      approvedAt: article.getApprovedAt(),
      rejectionReason: article.getRejectionReason(),
      images: article.getImages().map(img => ({
        id: img.id || '',
        filename: img.filename,
        url: img.url || '',
        alt: img.alt,
        order: img.order,
        isMain: img.isMain,
      })),
      isOwner,
      canEdit,
    };
  }

  private canUserViewArticle(article: any, userId?: string): boolean {
    // Artigos publicados são públicos
    if (article.isPublished()) {
      return true;
    }

    // Autor sempre pode ver seus próprios artigos
    if (userId && article.isOwnedBy(userId)) {
      return true;
    }

    // TODO: Admins e moderadores podem ver qualquer artigo
    return false;
  }
}
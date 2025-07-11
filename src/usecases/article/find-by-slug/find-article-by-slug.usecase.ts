// src/usecases/article/find-by-slug/find-article-by-slug.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { FindArticleBySlugUseCase as DomainFindArticleBySlugUseCase } from '@/domain/usecases/article/find-by-slug/find-article-by-slug.usecase';
import { ArticleNotFoundUsecaseException } from '@/usecases/exceptions/article/article-not-found.usecase.exception';

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
export class FindArticleBySlugUsecase implements Usecase<FindArticleBySlugInput, FindArticleBySlugOutput> {
  constructor(
    private readonly domainFindArticleBySlugUseCase: DomainFindArticleBySlugUseCase,
  ) {}

  async execute(input: FindArticleBySlugInput): Promise<FindArticleBySlugOutput> {
    try {
      return await this.domainFindArticleBySlugUseCase.execute(input);
    } catch (error) {
      if (error.name === 'InvalidInputUsecaseException' && error.message.includes('not found')) {
        throw new ArticleNotFoundUsecaseException(
          error.internalMessage || `Article not found with slug ${input.slug}`,
          error.externalMessage || 'Artigo não encontrado',
          FindArticleBySlugUsecase.name,
        );
      }

      throw error;
    }
  }
}
// src/usecases/article/find-by-id/find-article-by-id.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { FindArticleByIdUseCase as DomainFindArticleByIdUseCase } from '@/domain/usecases/article/find-by-id/find-article-by-id.usecase';
import { ArticleNotFoundUsecaseException } from '@/usecases/exceptions/article/article-not-found.usecase.exception';

export type FindArticleByIdInput = {
  id: string;
  currentUserId?: string;
  includeContent?: boolean;
};

export type FindArticleByIdOutput = {
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
export class FindArticleByIdUsecase implements Usecase<FindArticleByIdInput, FindArticleByIdOutput> {
  constructor(
    private readonly domainFindArticleByIdUseCase: DomainFindArticleByIdUseCase,
  ) {}

  async execute(input: FindArticleByIdInput): Promise<FindArticleByIdOutput> {
    try {
      return await this.domainFindArticleByIdUseCase.execute(input);
    } catch (error) {
      if (error.name === 'InvalidInputUsecaseException' && error.message.includes('not found')) {
        throw new ArticleNotFoundUsecaseException(
          error.internalMessage || `Article not found with id ${input.id}`,
          error.externalMessage || 'Artigo não encontrado',
          FindArticleByIdUsecase.name,
        );
      }

      throw error;
    }
  }
}
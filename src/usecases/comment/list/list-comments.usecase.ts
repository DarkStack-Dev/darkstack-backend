// src/usecases/comment/list/list-comments.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { ListCommentsUseCase as DomainListCommentsUseCase } from '@/domain/usecases/comment/list/list-comments.usecase';
import { CommentTarget } from '@/domain/entities/comment/comment.entity';

export type ListCommentsInput = {
  targetId: string;
  targetType: CommentTarget;
  page?: number;
  pageSize?: number;
  orderBy?: 'createdAt' | 'repliesCount';
  orderDirection?: 'asc' | 'desc';
  includeReplies?: boolean;
  currentUserId?: string;
};

export type ListCommentsOutput = {
  comments: Array<{
    id: string;
    content: string;
    isEdited: boolean;
    isDeleted: boolean;
    authorId: string;
    author: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    parentId?: string;
    repliesCount: number;
    approved: boolean;
    createdAt: Date;
    updatedAt: Date;
    canEdit: boolean;
    canDelete: boolean;
    replies?: Array<any>;
  }>;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
};

@Injectable()
export class ListCommentsUsecase implements Usecase<ListCommentsInput, ListCommentsOutput> {
  constructor(
    private readonly domainListCommentsUseCase: DomainListCommentsUseCase,
  ) {}

  async execute(input: ListCommentsInput): Promise<ListCommentsOutput> {
    try {
      // 1. Delegar para Domain Use Case
      const output = await this.domainListCommentsUseCase.execute(input);

      // 2. Application layer pode adicionar informações adicionais de infraestrutura
      // Por exemplo, URLs de avatar, formatação de datas, etc.

      return output;

    } catch (error) {
      this.handleDomainExceptions(error);
      throw error;
    }
  }

  private handleDomainExceptions(error: any): void {
    // Mapear exceptions se necessário
    // Por enquanto, apenas repassa
  }
}
// src/domain/usecases/comment/list/list-comments.usecase.ts - CORRIGIDO
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { CommentGatewayRepository, CommentWithAuthor, PaginatedCommentResult } from '@/domain/repositories/comment/comment.gateway.repository';
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
    parentId?: string; // ✅ CORRIGIDO: undefined em vez de string | null
    repliesCount: number;
    approved: boolean;
    createdAt: Date;
    updatedAt: Date;
    canEdit: boolean;
    canDelete: boolean;
    replies?: Array<{  // ✅ CORRIGIDO: Tipo específico em vez de any[]
      id: string;
      content: string;
      isEdited: boolean;
      authorId: string;
      author: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
      };
      createdAt: Date;
      canEdit: boolean;
      canDelete: boolean;
    }>;
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
export class ListCommentsUseCase implements UseCase<ListCommentsInput, ListCommentsOutput> {
  constructor(
    private readonly commentRepository: CommentGatewayRepository,
  ) {}

  async execute(input: ListCommentsInput): Promise<ListCommentsOutput> {
    const page = input.page || 1;
    const pageSize = Math.min(input.pageSize || 20, 100);
    const offset = (page - 1) * pageSize;

    // Buscar apenas comentários raiz (sem parentId)
    const result = await this.commentRepository.findRootComments(
      input.targetId,
      input.targetType,
      {
        limit: pageSize,
        offset,
        orderBy: input.orderBy || 'createdAt',
        orderDirection: input.orderDirection || 'desc',
      }
    );

    // Transformar resultado
    const comments = await Promise.all(
      result.comments.map(async (item) => {
        const comment = item.comment;
        
        // ✅ CORRIGIDO: Inicializar como array vazio com tipo específico
        let replies: Array<{
          id: string;
          content: string;
          isEdited: boolean;
          authorId: string;
          author: {
            id: string;
            name: string;
            email: string;
            avatar?: string;
          };
          createdAt: Date;
          canEdit: boolean;
          canDelete: boolean;
        }> = [];

        // Se solicitado, buscar primeiras respostas (preview)
        if (input.includeReplies && comment.getRepliesCount() > 0) {
          const repliesResult = await this.commentRepository.findReplies(comment.getId(), {
            limit: 3, // Apenas 3 primeiras para preview
            orderBy: 'createdAt',
            orderDirection: 'asc',
          });
          
          // ✅ CORRIGIDO: Mapear com tipo específico
          replies = repliesResult.comments.map(replyItem => ({
            id: replyItem.comment.getId(),
            content: replyItem.comment.getContent(),
            isEdited: replyItem.comment.getIsEdited(),
            authorId: replyItem.comment.getAuthorId(),
            author: replyItem.author,
            createdAt: replyItem.comment.getCreatedAt(),
            canEdit: input.currentUserId ? replyItem.comment.canBeEditedBy(input.currentUserId) : false,
            canDelete: false, // Será determinado pelo role do usuário
          }));
        }

        return {
          id: comment.getId(),
          content: comment.getContent(),
          isEdited: comment.getIsEdited(),
          isDeleted: comment.getIsDeleted(),
          authorId: comment.getAuthorId(),
          author: item.author,
          parentId: comment.getParentId() || undefined, // ✅ CORRIGIDO: null -> undefined
          repliesCount: comment.getRepliesCount(),
          approved: comment.getApproved(),
          createdAt: comment.getCreatedAt(),
          updatedAt: comment.getUpdatedAt(),
          canEdit: input.currentUserId ? comment.canBeEditedBy(input.currentUserId) : false,
          canDelete: false, // Será determinado pelo role do usuário
          replies: input.includeReplies && replies.length > 0 ? replies : undefined, // ✅ CORRIGIDO: Só incluir se tiver respostas
        };
      })
    );

    return {
      comments,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrevious: result.hasPrevious,
      },
    };
  }
}
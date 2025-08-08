// src/usecases/comment/find-replies/find-replies.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { CommentGatewayRepository, CommentWithAuthor } from '@/domain/repositories/comment/comment.gateway.repository';

export type FindRepliesInput = {
  parentId: string;
  page?: number;
  pageSize?: number;
  orderBy?: 'createdAt';
  orderDirection?: 'asc' | 'desc';
  currentUserId?: string;
};

export type FindRepliesOutput = {
  replies: Array<{
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
    parentId: string;
    approved: boolean;
    createdAt: Date;
    updatedAt: Date;
    canEdit: boolean;
    canDelete: boolean;
  }>;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  parentComment: {
    id: string;
    authorId: string;
    content: string;
    createdAt: Date;
  };
};

@Injectable()
export class FindRepliesUsecase implements Usecase<FindRepliesInput, FindRepliesOutput> {
  constructor(
    private readonly commentRepository: CommentGatewayRepository,
  ) {}

  async execute(input: FindRepliesInput): Promise<FindRepliesOutput> {
    const page = input.page || 1;
    const pageSize = Math.min(input.pageSize || 20, 100);
    const offset = (page - 1) * pageSize;

    // Buscar comentário pai
    const parentComment = await this.commentRepository.findById(input.parentId);
    if (!parentComment) {
      throw new Error('Parent comment not found');
    }

    // Buscar respostas
    const result = await this.commentRepository.findReplies(input.parentId, {
      limit: pageSize,
      offset,
      orderBy: input.orderBy || 'createdAt',
      orderDirection: input.orderDirection || 'asc',
    });

    const replies = result.comments.map(item => ({
      id: item.comment.getId(),
      content: item.comment.getContent(),
      isEdited: item.comment.getIsEdited(),
      isDeleted: item.comment.getIsDeleted(),
      authorId: item.comment.getAuthorId(),
      author: item.author,
      parentId: item.comment.getParentId()!,
      approved: item.comment.getApproved(),
      createdAt: item.comment.getCreatedAt(),
      updatedAt: item.comment.getUpdatedAt(),
      canEdit: input.currentUserId ? item.comment.canBeEditedBy(input.currentUserId) : false,
      canDelete: false, // Será determinado pelo role do usuário
    }));

    return {
      replies,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrevious: result.hasPrevious,
      },
      parentComment: {
        id: parentComment.getId(),
        authorId: parentComment.getAuthorId(),
        content: parentComment.getContent(),
        createdAt: parentComment.getCreatedAt(),
      },
    };
  }
}
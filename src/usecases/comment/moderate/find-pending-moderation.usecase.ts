// src/usecases/comment/moderate/find-pending-moderation.usecase.ts - CORRIGIDO
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { CommentGatewayRepository } from '@/domain/repositories/comment/comment.gateway.repository';
import { ArticleGatewayRepository } from '@/domain/repositories/article/article.gateway.repository';
import { ProjectsGatewayRepository } from '@/domain/repositories/projects/projects.gateway.repository';
import { CommentTarget } from '@/domain/entities/comment/comment.entity';

export type FindPendingModerationInput = {
  page?: number;
  pageSize?: number;
  targetType?: CommentTarget;
};

export type FindPendingModerationOutput = {
  comments: Array<{
    id: string;
    content: string;
    authorId: string;
    author: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    targetId: string;
    targetType: CommentTarget;
    targetInfo: {
      title: string;
      url?: string; // ✅ CORRIGIDO: opcional
    };
    parentId?: string; // ✅ CORRIGIDO: opcional
    parentInfo?: {
      id: string;
      content: string;
      authorName: string;
    };
    createdAt: Date;
    pendingDays: number;
  }>;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  summary: {
    totalPending: number;
    oldestPendingDays: number;
    byTargetType: Record<CommentTarget, number>;
  };
};

@Injectable()
export class FindPendingModerationUsecase implements Usecase<FindPendingModerationInput, FindPendingModerationOutput> {
  constructor(
    private readonly commentRepository: CommentGatewayRepository,
    private readonly articleRepository: ArticleGatewayRepository,
    private readonly projectsRepository: ProjectsGatewayRepository,
  ) {}

  async execute(input: FindPendingModerationInput): Promise<FindPendingModerationOutput> {
    const page = input.page || 1;
    const pageSize = Math.min(input.pageSize || 20, 50);
    const offset = (page - 1) * pageSize;

    const result = await this.commentRepository.findPendingModeration({
      limit: pageSize,
      offset,
      targetType: input.targetType,
    });

    const now = new Date();
    const comments = await Promise.all(
      result.comments.map(async (item) => {
        const comment = item.comment;
        const pendingDays = Math.floor(
          (now.getTime() - comment.getCreatedAt().getTime()) / (1000 * 60 * 60 * 24)
        );

        // ✅ CORRIGIDO: Buscar informações da entidade alvo
        let targetInfo = { title: 'Unknown', url: undefined as string | undefined };
        try {
          switch (comment.getTargetType()) {
            case 'ARTICLE':
              const article = await this.articleRepository.findById(comment.getTargetId());
              if (article) {
                targetInfo = {
                  title: article.getTitulo(), // ✅ CORRIGIDO: getTitulo() não getTitle()
                  url: `/articles/${article.getSlug()}`,
                };
              }
              break;
            case 'PROJECT':
              const project = await this.projectsRepository.findById(comment.getTargetId());
              if (project) {
                targetInfo = {
                  title: project.getName(),
                  url: `/projects/${project.getId()}`,
                };
              }
              break;
          }
        } catch (error) {
          console.error(`Error fetching target info for ${comment.getTargetType()}:`, error);
        }

        // ✅ CORRIGIDO: Buscar informações do comentário pai se existir
        let parentInfo: { id: string; content: string; authorName: string } | undefined = undefined;
        if (comment.getParentId()) {
          try {
            const parentCommentWithAuthor = await this.commentRepository.findByIdWithAuthor(
              comment.getParentId()!
            );
            if (parentCommentWithAuthor) {
              parentInfo = {
                id: parentCommentWithAuthor.comment.getId(),
                content: parentCommentWithAuthor.comment.getContent().substring(0, 100),
                authorName: parentCommentWithAuthor.author.name,
              };
            }
          } catch (error) {
            console.error('Error fetching parent comment info:', error);
          }
        }

        return {
          id: comment.getId(),
          content: comment.getContent(),
          authorId: comment.getAuthorId(),
          author: item.author,
          targetId: comment.getTargetId(),
          targetType: comment.getTargetType(),
          targetInfo,
          parentId: comment.getParentId() || undefined, // ✅ CORRIGIDO: null -> undefined
          parentInfo,
          createdAt: comment.getCreatedAt(),
          pendingDays,
        };
      })
    );

    // Calcular estatísticas
    const [totalPending, byTargetTypeStats] = await Promise.all([
      this.commentRepository.count({ approved: false, isDeleted: false }),
      this.calculateByTargetTypeStats(),
    ]);

    const oldestComment = comments.reduce((oldest, current) =>
      current.pendingDays > oldest.pendingDays ? current : oldest,
      comments[0] || { pendingDays: 0 }
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
      summary: {
        totalPending,
        oldestPendingDays: oldestComment.pendingDays,
        byTargetType: byTargetTypeStats,
      },
    };
  }

  private async calculateByTargetTypeStats(): Promise<Record<CommentTarget, number>> {
    const targetTypes: CommentTarget[] = ['ARTICLE', 'PROJECT', 'ISSUE', 'QA'];
    const stats = {} as Record<CommentTarget, number>;

    await Promise.all(
      targetTypes.map(async (targetType) => {
        const count = await this.commentRepository.count({
          targetType,
          approved: false,
          isDeleted: false,
        });
        stats[targetType] = count;
      })
    );

    return stats;
  }
}
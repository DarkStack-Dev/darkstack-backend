// 1. ✅ MY LIKES USECASE COMPLETO
// src/usecases/like/my-likes/my-likes.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { LikeGatewayRepository } from '@/domain/repositories/like/like.gateway.repository';
import { ArticleGatewayRepository } from '@/domain/repositories/article/article.gateway.repository';
import { ProjectsGatewayRepository } from '@/domain/repositories/projects/projects.gateway.repository';
import { CommentGatewayRepository } from '@/domain/repositories/comment/comment.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { LikeTarget } from '@/domain/entities/like/like.entity';

export type MyLikesInput = {
  userId: string;
  targetType?: LikeTarget;
  isLike?: boolean;
  page?: number;
  pageSize?: number;
  orderBy?: 'createdAt' | 'updatedAt';
  orderDirection?: 'asc' | 'desc';
};

export type MyLikesOutput = {
  likes: Array<{
    id: string;
    targetId: string;
    targetType: LikeTarget;
    targetTitle: string;
    targetUrl: string;
    isLike: boolean;
    createdAt: Date;
    updatedAt: Date;
    targetAuthor?: {
      id: string;
      name: string;
      avatar?: string;
    };
    targetStats: {
      totalLikes: number;
      totalDislikes: number;
      netLikes: number;
    };
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
    totalLikes: number;
    totalDislikes: number;
    totalGiven: number;
    byTargetType: Record<LikeTarget, number>;
    recentActivity: Array<{
      date: string;
      count: number;
    }>;
  };
};

@Injectable()
export class MyLikesUsecase implements Usecase<MyLikesInput, MyLikesOutput> {
  constructor(
    private readonly likeRepository: LikeGatewayRepository,
    private readonly articleRepository: ArticleGatewayRepository,
    private readonly projectsRepository: ProjectsGatewayRepository,
    private readonly commentRepository: CommentGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
  ) {}

  async execute(input: MyLikesInput): Promise<MyLikesOutput> {
    const page = input.page || 1;
    const pageSize = Math.min(input.pageSize || 20, 100);
    const offset = (page - 1) * pageSize;

    // Buscar likes do usuário
    const result = await this.likeRepository.findByUser(input.userId, {
      targetType: input.targetType,
      isLike: input.isLike,
      limit: pageSize,
      offset,
      orderBy: input.orderBy || 'createdAt',
      orderDirection: input.orderDirection || 'desc',
    });

    // Enriquecer com dados das entidades
    const enrichedLikes = await Promise.all(
      result.likes.map(async (item) => {
        const like = item.like;
        const targetData = await this.getTargetData(like.getTargetId(), like.getTargetType());
        const targetStats = await this.likeRepository.getLikeCounts(
          like.getTargetId(),
          like.getTargetType()
        );

        return {
          id: like.getId(),
          targetId: like.getTargetId(),
          targetType: like.getTargetType(),
          targetTitle: targetData.title,
          targetUrl: targetData.url,
          isLike: like.getIsLike(),
          createdAt: like.getCreatedAt(),
          updatedAt: like.getUpdatedAt(),
          targetAuthor: targetData.author,
          targetStats: {
            totalLikes: targetStats.likesCount,
            totalDislikes: targetStats.dislikesCount,
            netLikes: targetStats.netLikes,
          },
        };
      })
    );

    // Calcular estatísticas
    const summary = await this.calculateUserLikeSummary(input.userId, input.targetType);

    return {
      likes: enrichedLikes,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        hasNext: result.hasNext,
        hasPrevious: result.hasPrevious,
      },
      summary,
    };
  }

  private async getTargetData(targetId: string, targetType: LikeTarget) {
    switch (targetType) {
      case 'ARTICLE':
        const article = await this.articleRepository.findById(targetId);
        const articleAuthor = article ? await this.userRepository.findById(article.getAuthorId()) : null;
        return {
          title: article?.getTitulo() || 'Artigo não encontrado',
          url: `/articles/${article?.getSlug() || targetId}`,
          author: articleAuthor ? {
            id: articleAuthor.getId(),
            name: articleAuthor.getName(),
            avatar: articleAuthor.getAvatar(),
          } : undefined,
        };

      case 'PROJECT':
        const project = await this.projectsRepository.findById(targetId);
        const projectOwner = project ? await this.userRepository.findById(project.getOwnerId()) : null;
        return {
          title: project?.getName() || 'Projeto não encontrado',
          url: `/projects/${targetId}`,
          author: projectOwner ? {
            id: projectOwner.getId(),
            name: projectOwner.getName(),
            avatar: projectOwner.getAvatar(),
          } : undefined,
        };

      case 'COMMENT':
        const comment = await this.commentRepository.findById(targetId);
        const commentAuthor = comment ? await this.userRepository.findById(comment.getAuthorId()) : null;
        return {
          title: comment?.getContent().substring(0, 50) + '...' || 'Comentário não encontrado',
          url: `/comments/${targetId}`,
          author: commentAuthor ? {
            id: commentAuthor.getId(),
            name: commentAuthor.getName(),
            avatar: commentAuthor.getAvatar(),
          } : undefined,
        };

      case 'USER_PROFILE':
        const user = await this.userRepository.findById(targetId);
        return {
          title: user?.getName() || 'Usuário não encontrado',
          url: `/users/${targetId}`,
          author: user ? {
            id: user.getId(),
            name: user.getName(),
            avatar: user.getAvatar(),
          } : undefined,
        };

      default:
        return {
          title: 'Entidade desconhecida',
          url: '#',
          author: undefined,
        };
    }
  }

  private async calculateUserLikeSummary(userId: string, targetType?: LikeTarget) {
    const [totalLikes, totalDislikes, recentActivity] = await Promise.all([
      this.likeRepository.countByUser(userId, true),
      this.likeRepository.countByUser(userId, false),
      this.getLikeActivityLast30Days(userId, targetType),
    ]);

    const byTargetType = await this.getByTargetTypeStats(userId);

    return {
      totalLikes,
      totalDislikes,
      totalGiven: totalLikes + totalDislikes,
      byTargetType,
      recentActivity,
    };
  }

  private async getLikeActivityLast30Days(userId: string, targetType?: LikeTarget) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return this.likeRepository.getLikesByDateRange(startDate, endDate, undefined, targetType);
  }

  private async getByTargetTypeStats(userId: string): Promise<Record<LikeTarget, number>> {
    const targetTypes: LikeTarget[] = ['ARTICLE', 'PROJECT', 'COMMENT', 'USER_PROFILE', 'ISSUE', 'QA'];
    const stats = {} as Record<LikeTarget, number>;

    await Promise.all(
      targetTypes.map(async (targetType) => {
        const count = await this.likeRepository.count({
          userId,
          targetType,
        });
        stats[targetType] = count;
      })
    );

    return stats;
  }
}
// 2. ✅ TRENDING ALGORITHM BASEADO EM LIKES
// src/usecases/like/trending/trending-content.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { LikeGatewayRepository } from '@/domain/repositories/like/like.gateway.repository';
import { LikeTarget } from '@/domain/entities/like/like.entity';

export type TrendingContentInput = {
  targetType: LikeTarget;
  timeRange?: 'TODAY' | 'WEEK' | 'MONTH' | 'ALL_TIME';
  limit?: number;
  boostFactor?: number; // Fator de boost para conteúdo recente
};

export type TrendingContentOutput = {
  trending: Array<{
    targetId: string;
    targetTitle: string;
    targetUrl: string;
    score: number; // Score de trending calculado
    likesCount: number;
    dislikesCount: number;
    netLikes: number;
    likeVelocity: number; // Likes por hora nas últimas 24h
    trendingRank: number;
    author?: {
      id: string;
      name: string;
      avatar?: string;
    };
  }>;
  algorithm: {
    timeRange: string;
    boostFactor: number;
    description: string;
  };
};

@Injectable()
export class TrendingContentUsecase implements Usecase<TrendingContentInput, TrendingContentOutput> {
  constructor(
    private readonly likeRepository: LikeGatewayRepository,
    private readonly articleRepository: ArticleGatewayRepository,
    private readonly projectsRepository: ProjectsGatewayRepository,
    private readonly commentRepository: CommentGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
  ) {}

  async execute(input: TrendingContentInput): Promise<TrendingContentOutput> {
    const timeRange = input.timeRange || 'WEEK';
    const limit = input.limit || 20;
    const boostFactor = input.boostFactor || 1.5;

    // Calcular período de tempo
    const timeRanges = this.getTimeRangeDate(timeRange);
    
    // Buscar conteúdo mais curtido no período
    const mostLiked = await this.likeRepository.getMostLikedTargets(
      input.targetType,
      limit * 2, // Buscar mais para filtrar depois
      timeRanges
    );

    // Calcular scores de trending
    const trendingWithScores = await Promise.all(
      mostLiked.map(async (item, index) => {
        const velocity = await this.calculateLikeVelocity(item.targetId, input.targetType);
        const targetData = await this.getTargetMetadata(item.targetId, input.targetType);
        
        // Algoritmo de trending score
        const score = this.calculateTrendingScore({
          likes: item.likesCount,
          dislikes: item.dislikesCount,
          netLikes: item.netLikes,
          velocity,
          position: index,
          boostFactor,
        });

        return {
          targetId: item.targetId,
          targetTitle: item.targetTitle,
          targetUrl: targetData.url,
          score,
          likesCount: item.likesCount,
          dislikesCount: item.dislikesCount,
          netLikes: item.netLikes,
          likeVelocity: velocity,
          trendingRank: 0, // Será preenchido após ordenação
          author: targetData.author,
        };
      })
    );

    // Ordenar por score de trending e limitar
    const sorted = trendingWithScores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item, index) => ({
        ...item,
        trendingRank: index + 1,
      }));

    return {
      trending: sorted,
      algorithm: {
        timeRange,
        boostFactor,
        description: `Trending algorithm considering likes, velocity, and recency boost of ${boostFactor}x`,
      },
    };
  }

  private getTimeRangeDate(timeRange: string): { start: Date; end: Date } {
    const now = new Date();
    const end = now;
    let start: Date;

    switch (timeRange) {
      case 'TODAY':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'WEEK':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'MONTH':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = new Date(0); // All time
    }

    return { start, end };
  }

  private async calculateLikeVelocity(targetId: string, targetType: LikeTarget): Promise<number> {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const now = new Date();
    
    const recentActivity = await this.likeRepository.getLikesByDateRange(
      last24h,
      now,
      targetId,
      targetType
    );

    const totalLikes = recentActivity.reduce((sum, day) => sum + day.likes, 0);
    return totalLikes / 24; // Likes por hora
  }

  private calculateTrendingScore(params: {
    likes: number;
    dislikes: number;
    netLikes: number;
    velocity: number;
    position: number;
    boostFactor: number;
  }): number {
    const { likes, dislikes, netLikes, velocity, position, boostFactor } = params;
    
    // Fatores do algoritmo
    const likeRatio = likes > 0 ? likes / (likes + dislikes) : 0;
    const positionPenalty = Math.pow(0.95, position); // Penalidade por posição
    const velocityBoost = 1 + (velocity * 0.1); // Boost baseado em velocidade
    
    // Score final
    const baseScore = netLikes * likeRatio * positionPenalty;
    const finalScore = baseScore * velocityBoost * boostFactor;
    
    return Math.round(finalScore * 100) / 100;
  }

  private async getTargetMetadata(targetId: string, targetType: LikeTarget) {
    // Implementação similar ao MyLikesUsecase
    switch (targetType) {
      case 'ARTICLE':
        const article = await this.articleRepository.findById(targetId);
        const articleAuthor = article ? await this.userRepository.findById(article.getAuthorId()) : null;
        return {
          url: `/articles/${article?.getSlug() || targetId}`,
          author: articleAuthor ? {
            id: articleAuthor.getId(),
            name: articleAuthor.getName(),
            avatar: articleAuthor.getAvatar(),
          } : undefined,
        };
      // ... outros casos
      default:
        return { url: '#', author: undefined };
    }
  }
}

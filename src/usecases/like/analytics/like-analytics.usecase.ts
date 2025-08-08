// 5. ✅ ANALYTICS AVANÇADO
// src/usecases/like/analytics/like-analytics.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { LikeGatewayRepository } from '@/domain/repositories/like/like.gateway.repository';
import { LikeTarget } from '@/domain/entities/like/like.entity';

export type LikeAnalyticsInput = {
  targetId?: string;
  targetType?: LikeTarget;
  timeRange: {
    start: Date;
    end: Date;
  };
  granularity?: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH';
};

export type LikeAnalyticsOutput = {
  overview: {
    totalLikes: number;
    totalDislikes: number;
    netLikes: number;
    likeRatio: number;
    averageLikesPerDay: number;
    peakDay: {
      date: string;
      likes: number;
    };
  };
  timeline: Array<{
    period: string;
    likes: number;
    dislikes: number;
    netLikes: number;
    cumulativeLikes: number;
  }>;
  topContent: Array<{
    targetId: string;
    targetTitle: string;
    likesCount: number;
    dislikesCount: number;
    netLikes: number;
    engagement: number;
  }>;
  topLikers: Array<{
    userId: string;
    userName: string;
    totalGiven: number;
    likesGiven: number;
    dislikesGiven: number;
  }>;
  patterns: {
    bestTimeOfDay: Array<{
      hour: number;
      averageLikes: number;
    }>;
    bestDayOfWeek: Array<{
      dayOfWeek: number; // 0 = Sunday
      dayName: string;
      averageLikes: number;
    }>;
    likeVelocityTrend: 'INCREASING' | 'DECREASING' | 'STABLE';
  };
  insights: Array<{
    type: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    title: string;
    description: string;
    value?: number;
  }>;
};

@Injectable()
export class LikeAnalyticsUsecase implements Usecase<LikeAnalyticsInput, LikeAnalyticsOutput> {
  constructor(
    private readonly likeRepository: LikeGatewayRepository,
  ) {}

  async execute(input: LikeAnalyticsInput): Promise<LikeAnalyticsOutput> {
    // Buscar dados do período
    const timelineData = await this.likeRepository.getLikesByDateRange(
      input.timeRange.start,
      input.timeRange.end,
      input.targetId,
      input.targetType
    );

    // Calcular overview
    const overview = this.calculateOverview(timelineData, input.timeRange);
    
    // Calcular timeline com granularidade
    const timeline = this.calculateTimeline(timelineData, input.granularity || 'DAY');
    
    // Top content e likers
    const [topContent, topLikers] = await Promise.all([
      this.getTopContent(input.targetType, input.timeRange),
      this.getTopLikers(input.targetType, input.timeRange),
    ]);

    // Análise de padrões
    const patterns = this.analyzePatterns(timelineData);
    
    // Gerar insights
    const insights = this.generateInsights(overview, timeline, patterns);

    return {
      overview,
      timeline,
      topContent,
      topLikers,
      patterns,
      insights,
    };
  }

  private calculateOverview(timelineData: any[], timeRange: { start: Date; end: Date }) {
    const totalLikes = timelineData.reduce((sum, day) => sum + day.likes, 0);
    const totalDislikes = timelineData.reduce((sum, day) => sum + day.dislikes, 0);
    const netLikes = totalLikes - totalDislikes;
    const likeRatio = totalLikes > 0 ? totalLikes / (totalLikes + totalDislikes) : 0;
    
    const daysDiff = Math.ceil((timeRange.end.getTime() - timeRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const averageLikesPerDay = totalLikes / daysDiff;
    
    const peakDay = timelineData.reduce((peak, day) => 
      day.likes > peak.likes ? day : peak, 
      { date: '', likes: 0 }
    );

    return {
      totalLikes,
      totalDislikes,
      netLikes,
      likeRatio: Math.round(likeRatio * 100) / 100,
      averageLikesPerDay: Math.round(averageLikesPerDay * 100) / 100,
      peakDay,
    };
  }

  private calculateTimeline(timelineData: any[], granularity: string) {
    // Implementar agrupamento por granularidade
    let cumulativeLikes = 0;
    
    return timelineData.map(day => {
      cumulativeLikes += day.likes;
      return {
        period: day.date,
        likes: day.likes,
        dislikes: day.dislikes,
        netLikes: day.likes - day.dislikes,
        cumulativeLikes,
      };
    });
  }

  private async getTopContent(targetType?: LikeTarget, timeRange?: { start: Date; end: Date }) {
    if (!targetType) return [];
    
    return this.likeRepository.getMostLikedTargets(targetType, 10, timeRange);
  }

  private async getTopLikers(targetType?: LikeTarget, timeRange?: { start: Date; end: Date }) {
    return this.likeRepository.getMostActiveLikers(10, targetType, timeRange);
  }

  private analyzePatterns(timelineData: any[]) {
    // Análise de padrões temporais
    const hourlyData = new Array(24).fill(0);
    const dailyData = new Array(7).fill(0);
    
    // Simular análise (implementação real dependeria dos dados)
    const bestTimeOfDay = hourlyData.map((_, hour) => ({
      hour,
      averageLikes: Math.random() * 10, // Placeholder
    }));

    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const bestDayOfWeek = dailyData.map((_, day) => ({
      dayOfWeek: day,
      dayName: dayNames[day],
      averageLikes: Math.random() * 15, // Placeholder
    }));

    // Calcular tendência de velocidade
    const recentVelocity = timelineData.slice(-7).reduce((sum, day) => sum + day.likes, 0) / 7;
    const previousVelocity = timelineData.slice(-14, -7).reduce((sum, day) => sum + day.likes, 0) / 7;
    
    let likeVelocityTrend: 'INCREASING' | 'DECREASING' | 'STABLE';
    if (recentVelocity > previousVelocity * 1.1) {
      likeVelocityTrend = 'INCREASING';
    } else if (recentVelocity < previousVelocity * 0.9) {
      likeVelocityTrend = 'DECREASING';
    } else {
      likeVelocityTrend = 'STABLE';
    }

    return {
      bestTimeOfDay,
      bestDayOfWeek,
      likeVelocityTrend,
    };
  }

  private generateInsights(overview: any, timeline: any[], patterns: any) {
    const insights: any[] = [];

    // Insight sobre crescimento
    if (patterns.likeVelocityTrend === 'INCREASING') {
      insights.push({
        type: 'POSITIVE',
        title: 'Crescimento Acelerado',
        description: 'Os likes estão crescendo mais rapidamente na última semana',
        value: overview.averageLikesPerDay,
      });
    }

    // Insight sobre engajamento
    if (overview.likeRatio > 0.8) {
      insights.push({
        type: 'POSITIVE',
        title: 'Alto Engajamento Positivo',
        description: `${Math.round(overview.likeRatio * 100)}% dos likes são positivos`,
        value: overview.likeRatio,
      });
    }

    // Insight sobre volume
    if (overview.totalLikes > 1000) {
      insights.push({
        type: 'POSITIVE',
        title: 'Marco de Popularidade',
        description: `Conteúdo ultrapassou ${overview.totalLikes} likes!`,
        value: overview.totalLikes,
      });
    }

    return insights;
  }
}
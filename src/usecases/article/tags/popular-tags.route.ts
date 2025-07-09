// 3. Route para tags populares
// src/infra/web/routes/article/tags/popular-tags.route.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ArticleGatewayRepository } from '@/domain/repositories/article/article.gateway.repository';
import { IsPublic } from '@/infra/web/auth/decorators/is-public.decorator';

export type PopularTagsResponse = {
  tags: Array<{
    tag: string;
    count: number;
    percentage: number;
  }>;
  total: number;
};

@Controller('/articles')
export class PopularTagsRoute {
  constructor(
    private readonly articleRepository: ArticleGatewayRepository,
  ) {}

  @Get('/tags/popular')
  @IsPublic()
  public async handle(@Query('limit') limit: string): Promise<PopularTagsResponse> {
    const maxLimit = Math.min(parseInt(limit) || 20, 100);

    console.log(`🏷️ Buscando ${maxLimit} tags mais populares`);

    const popularTags = await this.articleRepository.getPopularTags(maxLimit);
    const totalArticles = await this.articleRepository.count({ 
      status: 'APPROVED' as any,
      isActive: true 
    });

    const tagsWithPercentage = popularTags.map(({ tag, count }) => ({
      tag,
      count,
      percentage: totalArticles > 0 ? Math.round((count / totalArticles) * 100) : 0,
    }));

    return {
      tags: tagsWithPercentage,
      total: popularTags.length,
    };
  }
}
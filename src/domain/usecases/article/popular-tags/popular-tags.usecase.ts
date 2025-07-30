// src/domain/usecases/article/popular-tags/popular-tags.usecase.ts
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { ArticleGatewayRepository } from '@/domain/repositories/article/article.gateway.repository';
import { InvalidInputUsecaseException } from '../../exceptions/input/invalid-input.usecase.exception';

export type PopularTagsInput = {
  limit?: number;
};

export type PopularTagsOutput = {
  tags: Array<{
    tag: string;
    count: number;
    percentage: number;
  }>;
  total: number;
};

@Injectable()
export class PopularTagsUseCase implements UseCase<PopularTagsInput, PopularTagsOutput> {
  constructor(
    private readonly articleRepository: ArticleGatewayRepository,
  ) {}

  async execute({ limit = 20 }: PopularTagsInput): Promise<PopularTagsOutput> {
    // Validar limite
    const maxLimit = Math.min(limit, 100);
    if (maxLimit < 1) {
      throw new InvalidInputUsecaseException(
        `Invalid limit ${limit}, must be between 1 and 100`,
        'Limite deve estar entre 1 e 100',
        PopularTagsUseCase.name,
      );
    }

    console.log(`🏷️ Buscando ${maxLimit} tags mais populares`);

    // Buscar tags populares e total de artigos em paralelo
    const [popularTags, totalArticles] = await Promise.all([
      this.articleRepository.getPopularTags(maxLimit),
      this.articleRepository.count({ 
        status: 'APPROVED' as any,
        isActive: true 
      })
    ]);

    // Calcular percentuais
    const tagsWithPercentage = popularTags.map(({ tag, count }) => ({
      tag,
      count,
      percentage: totalArticles > 0 ? Math.round((count / totalArticles) * 100) : 0,
    }));

    console.log(`✅ Encontradas ${tagsWithPercentage.length} tags populares`);

    return {
      tags: tagsWithPercentage,
      total: tagsWithPercentage.length,
    };
  }
}
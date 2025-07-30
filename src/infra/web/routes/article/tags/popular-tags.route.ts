// src/infra/web/routes/article/tags/popular-tags.route.ts
import { Controller, Get, Query } from '@nestjs/common';
import { PopularTagsUsecase } from '@/usecases/article/popular-tags/popular-tags.usecase';
import { IsPublic } from '@/infra/web/auth/decorators/is-public.decorator';

export type PopularTagsQuery = {
  limit?: string;
};

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
    private readonly popularTagsUsecase: PopularTagsUsecase, // ✅ Usando caso de uso
  ) {}

  @Get('/tags/popular')
  @IsPublic()
  public async handle(@Query() query: PopularTagsQuery): Promise<PopularTagsResponse> {
    const limit = query.limit ? parseInt(query.limit) : 20;

    console.log(`🏷️ API: Buscando ${limit} tags mais populares`);

    const output = await this.popularTagsUsecase.execute({
      limit,
    });

    console.log(`✅ API: Encontradas ${output.total} tags populares`);

    return output;
  }
}
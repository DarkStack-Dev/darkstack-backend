// src/infra/web/routes/like/my-likes/my-likes.route.ts
import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { MyLikesResponse } from './my-likes.dto';
import { Roles } from '@/infra/web/auth/decorators/roles.decorator';

@Controller('/likes')
export class MyLikesRoute {
  constructor(
    // Implementar MyLikesUsecase quando necessário
  ) {}

  @Get('/my-likes')
  @Roles('USER', 'MODERATOR', 'ADMIN')
  public async handle(
    @Query() query: any,
    @Req() req: Request,
  ): Promise<MyLikesResponse> {
    const userId = req['userId'];

    // TODO: Implementar MyLikesUsecase
    return {
      likes: [],
      pagination: {
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
      summary: {
        totalLikes: 0,
        totalDislikes: 0,
        totalGiven: 0,
        byTargetType: {},
      },
    };
  }
}
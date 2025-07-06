// src/infra/web/routes/projects/my-projects/my-projects.route.ts - ATUALIZADA

import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { MyProjectsQuery, MyProjectsResponse } from './my-projects.dto';
import { MyProjectsPresenter } from './my-projects.presenter';
import { MyProjectsUseCase } from '@/domain/usecases/projects/my-projects/my-projects.usecase';

@Controller('/projects')
export class MyProjectsRoute {
  constructor(
    private readonly myProjectsUseCase: MyProjectsUseCase,
  ) {}

  @Get('/my-projects')
  public async handle(
    @Query() query: MyProjectsQuery,
    @Req() req: Request,
  ): Promise<MyProjectsResponse> {
    const userId = req['userId']; // Vem do AuthGuard

    const output = await this.myProjectsUseCase.execute({
      userId,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 10,
      status: query.status,
      includeDeleted: query.includeDeleted === 'true',
    });

    return MyProjectsPresenter.toHttp(output);
  }
}
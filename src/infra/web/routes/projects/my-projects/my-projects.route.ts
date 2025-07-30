// src/infra/web/routes/projects/my-projects/my-projects.route.ts - ATUALIZADA

import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { MyProjectsQuery, MyProjectsResponse } from './my-projects.dto';
import { MyProjectsPresenter } from './my-projects.presenter';
import { MyProjectsUsecase } from '@/usecases/projects/my-projects/my-projects.usecase'; // ✅ CORRIGIDO

@Controller('/aaa')
export class MyProjectsRoute {
  constructor(
    private readonly myProjectsUsecase: MyProjectsUsecase, // ✅ CORRIGIDO
  ) {}

  @Get('/my-projects')
  public async handle(
    @Query() query: MyProjectsQuery,
    @Req() req: Request,
  ): Promise<MyProjectsResponse> {
    const userId = req['userId']; // Vem do AuthGuard
    console.log(`🔍 API: Buscando projetos do usuário ID: ${userId}`);
    const output = await this.myProjectsUsecase.execute({ // ✅ CORRIGIDO
      userId,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 10,
      status: query.status,
      includeDeleted: query.includeDeleted === 'true',
    });

    return MyProjectsPresenter.toHttp(output);
  }
}
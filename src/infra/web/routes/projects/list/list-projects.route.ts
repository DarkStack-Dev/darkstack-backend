// src/infra/web/routes/projects/list/list-projects.route.ts - ATUALIZADA

import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { ListProjectsQuery, ListProjectsResponse } from './list-projects.dto';
import { ListProjectsPresenter } from './list-projects.presenter';
import { IsPublic } from '@/infra/web/auth/decorators/is-public.decorator';
import { ProjectStatus } from 'generated/prisma';
import { ListProjectsUseCase } from '@/domain/usecases/projects/list/list-projects.usecase';

@Controller('/projects')
export class ListProjectsRoute {
  constructor(
    private readonly listProjectsUseCase: ListProjectsUseCase,
  ) {}

  @IsPublic()
  @Get()
  public async handle(
    @Query() query: ListProjectsQuery,
    @Req() req: Request,
  ): Promise<ListProjectsResponse> {
    const currentUserId = req['userId']; // Pode ser undefined se não autenticado

    const output = await this.listProjectsUseCase.execute({
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 12,
      status: query.status,
      search: query.search,
      ownerId: query.ownerId,
      currentUserId,
    });

    return ListProjectsPresenter.toHttp(output);
  }
}
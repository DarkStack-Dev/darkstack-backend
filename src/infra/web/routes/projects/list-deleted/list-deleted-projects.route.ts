// src/infra/web/routes/projects/list-deleted/list-deleted-projects.route.ts - ATUALIZADA

import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { Roles } from '@/infra/web/auth/decorators/roles.decorator';
import { ListDeletedProjectsUsecase, ListDeletedProjectsOutput } from '@/usecases/projects/list-deleted/list-deleted-projects.usecase'; // ✅ CORRIGIDO

export type ListDeletedProjectsQuery = {
  page?: string;
  limit?: string;
};

export type ListDeletedProjectsResponse = ListDeletedProjectsOutput;

@Controller('/projects')
export class ListDeletedProjectsRoute {
  constructor(
    private readonly listDeletedProjectsUsecase: ListDeletedProjectsUsecase, // ✅ CORRIGIDO
  ) {}

  /**
   * Lista projetos deletados (apenas admin/moderador)
   * GET /projects/deleted
   */
  @Get('/deleted')
  @Roles('ADMIN', 'MODERATOR')
  public async handle(
    @Query() query: ListDeletedProjectsQuery,
    @Req() req: Request,
  ): Promise<ListDeletedProjectsResponse> {
    const userId = req['userId'];
    const userRoles = req['user']?.roles || [];

    console.log(`🗑️ API: Listando projetos deletados para ${userId}`);

    const output = await this.listDeletedProjectsUsecase.execute({ // ✅ CORRIGIDO
      userId,
      userRoles,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 20,
    });

    console.log(`✅ API: Encontrados ${output.projects.length} projetos deletados`);

    return output; // Retorna diretamente sem presenter
  }
}
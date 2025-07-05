// ===== ROUTE =====

// src/infra/web/routes/projects/list/list-projects.route.ts

import { Controller, Get, Query } from '@nestjs/common';
import { ProjectsGatewayRepository } from '@/domain/repositories/projects/projects.gateway.repository';
import { ListProjectsQuery, ListProjectsResponse } from './list-projects.dto';
import { ListProjectsPresenter } from './list-projects.presenter';
import { IsPublic } from '@/infra/web/auth/decorators/is-public.decorator';
import { ProjectStatus } from 'generated/prisma';

@Controller('/projects')
export class ListProjectsRoute {
  constructor(
    private readonly projectsRepository: ProjectsGatewayRepository,
  ) {}

  @IsPublic()
  @Get()
  public async handle(@Query() query: ListProjectsQuery): Promise<ListProjectsResponse> {
    const page = parseInt(query.page || '1');
    const limit = Math.min(parseInt(query.limit || '12'), 50); // Máximo 50 por página
    const offset = (page - 1) * limit;

    console.log(`📋 Listando projetos - Página: ${page}, Limite: ${limit}`);

    // Filtros
    const filters: any = {
      limit,
      offset,
    };

    // Apenas projetos aprovados para usuários não autenticados
    if (query.status) {
      filters.status = query.status;
    } else {
      filters.status = ProjectStatus.APPROVED; // Default: apenas aprovados
    }

    if (query.search) {
      filters.search = query.search;
    }

    if (query.ownerId) {
      filters.ownerId = query.ownerId;
    }

    try {
      const { projects, total } = await this.projectsRepository.findWithFilters(filters);

      console.log(`✅ Encontrados ${projects.length} de ${total} projetos`);

      return ListProjectsPresenter.toHttp(projects, total, page, limit);
    } catch (error) {
      console.error('❌ Erro ao listar projetos:', error);
      throw error;
    }
  }
}
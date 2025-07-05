// ===== ROUTE =====

// src/infra/web/routes/projects/my-projects/my-projects.route.ts

import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { ProjectsGatewayRepository } from '@/domain/repositories/projects/projects.gateway.repository';
import { MyProjectsQuery, MyProjectsResponse } from './my-projects.dto';
import { MyProjectsPresenter } from './my-projects.presenter';
import { ProjectStatus } from 'generated/prisma';

@Controller('/projects')
export class MyProjectsRoute {
  constructor(
    private readonly projectsRepository: ProjectsGatewayRepository,
  ) {}

  @Get('/my-projects')
  public async handle(
    @Query() query: MyProjectsQuery,
    @Req() req: Request,
  ): Promise<MyProjectsResponse> {
    const userId = req['userId']; // Vem do AuthGuard
    const page = parseInt(query.page || '1');
    const limit = Math.min(parseInt(query.limit || '10'), 50);
    const offset = (page - 1) * limit;
    const includeDeleted = query.includeDeleted === 'true';

    console.log(`📋 Listando meus projetos para userId: ${userId}`);

    try {
      // Buscar projetos com filtros
      const filters: any = {
        ownerId: userId,
        limit,
        offset,
      };

      if (query.status) {
        filters.status = query.status;
      }

      // Se não incluir deletados, buscar apenas ativos
      const { projects, total } = includeDeleted 
        ? await this.projectsRepository.findWithFilters(filters)
        : await this.projectsRepository.findWithFilters(filters);

      // Buscar estatísticas do usuário
      const stats = await this.projectsRepository.getProjectStats();
      
      // Filtrar stats apenas para este usuário
      const userStats = {
        total: await this.projectsRepository.amountProjectsByUserId(userId),
        pending: await this.projectsRepository.amountProjectsByUserIdAndStatus(userId, ProjectStatus.PENDING),
        approved: await this.projectsRepository.amountProjectsByUserIdAndStatus(userId, ProjectStatus.APPROVED),
        rejected: await this.projectsRepository.amountProjectsByUserIdAndStatus(userId, ProjectStatus.REJECTED),
        archived: await this.projectsRepository.amountProjectsByUserIdAndStatus(userId, ProjectStatus.ARCHIVED),
      };

      console.log(`✅ Encontrados ${projects.length} projetos do usuário`);
      console.log(`📊 Stats: ${JSON.stringify(userStats)}`);

      return MyProjectsPresenter.toHttp(projects, userStats, total, page, limit);
    } catch (error) {
      console.error('❌ Erro ao listar meus projetos:', error);
      throw error;
    }
  }
}
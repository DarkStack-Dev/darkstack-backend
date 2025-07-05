// ===== ROUTE =====

// src/infra/web/routes/projects/find-by-id/find-project-by-id.route.ts

import { Controller, Get, Param, Req, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { ProjectsGatewayRepository } from '@/domain/repositories/projects/projects.gateway.repository';
import { FindProjectByIdResponse } from './find-project-by-id.dto';
import { FindProjectByIdPresenter } from './find-project-by-id.presenter';
import { IsPublic } from '@/infra/web/auth/decorators/is-public.decorator';

@Controller('/projects')
export class FindProjectByIdRoute {
  constructor(
    private readonly projectsRepository: ProjectsGatewayRepository,
  ) {}

  @IsPublic() // Projetos aprovados podem ser visualizados por qualquer um
  @Get('/:id')
  public async handle(
    @Param('id') projectId: string,
    @Req() req: Request,
  ): Promise<FindProjectByIdResponse> {
    console.log(`🔍 Buscando projeto ID: ${projectId}`);

    const project = await this.projectsRepository.findById(projectId);
    
    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    // Verificar se o projeto está ativo e aprovado (a menos que seja o dono)
    const currentUserId = req['userId']; // Pode ser undefined se não autenticado
    const isOwner = currentUserId === project.getOwnerId();
    
    if (!isOwner && project.getStatus() !== 'APPROVED') {
      throw new NotFoundException('Projeto não encontrado');
    }

    console.log(`✅ Projeto encontrado: ${project.getName()}`);

    return FindProjectByIdPresenter.toHttp(project, currentUserId);
  }
}
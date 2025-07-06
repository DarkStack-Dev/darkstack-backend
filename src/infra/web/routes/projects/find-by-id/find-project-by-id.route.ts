// src/infra/web/routes/projects/find-by-id/find-project-by-id.route.ts - ATUALIZADA

import { Controller, Get, Param, Req, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { FindProjectByIdResponse } from './find-project-by-id.dto';
import { FindProjectByIdPresenter } from './find-project-by-id.presenter';
import { IsPublic } from '@/infra/web/auth/decorators/is-public.decorator';
import { FindProjectByIdUseCase } from '@/domain/usecases/projects/find-by-id/find-project-by-id.usecase';

@Controller('/projects')
export class FindProjectByIdRoute {
  constructor(
    private readonly findProjectByIdUseCase: FindProjectByIdUseCase,
  ) {}

  @IsPublic() // Projetos aprovados podem ser visualizados por qualquer um
  @Get('/:id')
  public async handle(
    @Param('id') projectId: string,
    @Req() req: Request,
  ): Promise<FindProjectByIdResponse> {
    console.log(`🔍 API: Buscando projeto ID: ${projectId}`);

    const currentUserId = req['userId']; // Pode ser undefined se não autenticado

    try {
      const output = await this.findProjectByIdUseCase.execute({
        projectId,
        currentUserId,
      });

      console.log(`✅ API: Projeto encontrado: ${output.name}`);

      return FindProjectByIdPresenter.toHttp(output);
    } catch (error) {
      console.error(`❌ API: Erro ao buscar projeto ${projectId}:`, error);
      throw new NotFoundException('Projeto não encontrado');
    }
  }
}
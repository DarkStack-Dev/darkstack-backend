// src/infra/web/routes/projects/update/update-project.route.ts

import { Controller, Put, Param, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { UpdateProjectRequest, UpdateProjectResponse } from './update-project.dto';
import { UpdateProjectPresenter } from './update-project.presenter';
import { UpdateProjectUsecase } from '@/usecases/projects/update/update-project.usecase';

@Controller('/projects')
export class UpdateProjectRoute {
  constructor(
    private readonly updateProjectUsecase: UpdateProjectUsecase,
  ) {}

  /**
   * Atualizar projeto próprio (apenas proprietário)
   * PUT /projects/:id
   */
  @Put('/:id')
  public async handle(
    @Param('id') projectId: string,
    @Body() request: UpdateProjectRequest,
    @Req() req: Request,
  ): Promise<UpdateProjectResponse> {
    const userId = req['userId']; // Vem do AuthGuard

    console.log(`✏️ API: Atualizando projeto ${projectId} por usuário ${userId}`);

    const output = await this.updateProjectUsecase.execute({
      projectId,
      userId,
      name: request.name,
      description: request.description,
      images: request.images,
      shouldResetStatus: request.shouldResetStatus ?? true,
    });

    console.log(`✅ API: Projeto ${output.project.name} atualizado com sucesso`);
    if (output.statusChanged) {
      console.log(`📊 Status alterado para: ${output.project.status}`);
    }

    return UpdateProjectPresenter.toHttp(output);
  }
}
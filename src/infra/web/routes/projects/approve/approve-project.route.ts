// src/infra/web/routes/projects/approve/approve-project.route.ts

import { Controller, Post, Param, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApproveProjectRequest, ApproveProjectResponse } from './approve-project.dto';
import { ApproveProjectPresenter } from './approve-project.presenter';
import { Roles } from '@/infra/web/auth/decorators/roles.decorator';
import { ApproveProjectUsecase } from '@/usecases/projects/approve/approve-project.usecase';

@Controller('/projects')
export class ApproveProjectRoute {
  constructor(
    private readonly approveProjectUsecase: ApproveProjectUsecase,
  ) {}

  /**
   * Aprovar ou rejeitar projeto (apenas moderadores/admins)
   * POST /projects/:id/moderate
   */
  @Post('/:id/moderate')
  @Roles('ADMIN', 'MODERATOR')
  public async handle(
    @Param('id') projectId: string,
    @Body() request: ApproveProjectRequest,
    @Req() req: Request,
  ): Promise<ApproveProjectResponse> {
    const moderatorId = req['userId'];
    const moderatorRoles = req['user']?.roles || [];

    console.log(`🔍 API: ${request.action === 'approve' ? 'Aprovando' : 'Rejeitando'} projeto ${projectId} por moderador ${moderatorId}`);

    // Validar campos obrigatórios
    if (request.action === 'reject' && (!request.reason || request.reason.trim().length === 0)) {
      throw new Error('Motivo da rejeição é obrigatório');
    }

    const output = await this.approveProjectUsecase.execute({
      projectId,
      moderatorId,
      moderatorRoles,
      action: request.action,
      reason: request.reason,
      comments: request.comments,
    });

    console.log(`✅ API: Projeto ${output.project.name} ${request.action === 'approve' ? 'aprovado' : 'rejeitado'} por ${output.moderator.name}`);

    return ApproveProjectPresenter.toHttp(output);
  }
}
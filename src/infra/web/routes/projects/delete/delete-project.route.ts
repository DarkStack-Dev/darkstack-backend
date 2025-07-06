// src/infra/web/routes/projects/delete/delete-project.route.ts - ATUALIZADA

import { Controller, Delete, Param, Req, Post } from '@nestjs/common';
import { Request } from 'express';
import { DeleteProjectResponse } from './delete-project.dto';
import { DeleteProjectPresenter } from './delete-project.presenter';
import { Roles } from '@/infra/web/auth/decorators/roles.decorator';
import { DeleteProjectUseCase } from '@/domain/usecases/projects/delete/delete-project.usecase';
import { RestoreProjectUseCase } from '@/domain/usecases/projects/restore/restore-project.usecase';

@Controller('/projects')
export class DeleteProjectRoute {
  constructor(
    private readonly deleteProjectUseCase: DeleteProjectUseCase,
    private readonly restoreProjectUseCase: RestoreProjectUseCase,
  ) {}

  /**
   * Soft delete - marca projeto como deletado
   * DELETE /projects/:id
   */
  @Delete('/:id')
  public async handle(
    @Param('id') projectId: string,
    @Req() req: Request,
  ): Promise<DeleteProjectResponse> {
    const userId = req['userId'];
    const userRoles = req['user']?.roles || [];

    console.log(`🗑️ API: Soft delete do projeto ${projectId} por userId: ${userId}`);

    const output = await this.deleteProjectUseCase.execute({
      projectId,
      userId,
      userRoles,
      isPermanent: false,
    });

    console.log(`✅ API: ${output.message}`);

    return DeleteProjectPresenter.toHttp(output);
  }

  /**
   * Hard delete - remove projeto permanentemente (apenas admins)
   * DELETE /projects/:id/permanent
   */
  @Delete('/:id/permanent')
  @Roles('ADMIN')
  public async hardDelete(
    @Param('id') projectId: string,
    @Req() req: Request,
  ): Promise<DeleteProjectResponse> {
    const userId = req['userId'];
    const userRoles = req['user']?.roles || [];

    console.log(`💀 API: Hard delete do projeto ${projectId} por admin ${userId}`);

    const output = await this.deleteProjectUseCase.execute({
      projectId,
      userId,
      userRoles,
      isPermanent: true,
    });

    console.log(`✅ API: ${output.message}`);

    return DeleteProjectPresenter.toHttp(output);
  }

  /**
   * Restaurar projeto deletado (apenas admin/moderador)
   * POST /projects/:id/restore
   */
  @Post('/:id/restore')
  @Roles('ADMIN', 'MODERATOR')
  public async restore(
    @Param('id') projectId: string,
    @Req() req: Request,
  ): Promise<{ success: boolean; message: string; restoredAt: Date }> {
    const userId = req['userId'];
    const userRoles = req['user']?.roles || [];

    console.log(`🔄 API: Restaurando projeto ${projectId} por ${userId}`);

    const output = await this.restoreProjectUseCase.execute({
      projectId,
      userId,
      userRoles,
    });

    console.log(`✅ API: ${output.message}`);

    return {
      success: output.success,
      message: output.message,
      restoredAt: output.restoredAt,
    };
  }
}
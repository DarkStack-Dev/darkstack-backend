// src/infra/web/routes/user/moderator-update/moderator-update-user.route.ts

import { Controller, Patch, Param, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { ModeratorUpdateUserRequest, ModeratorUpdateUserResponse } from './moderator-update-user.dto';
import { ModeratorUpdateUserPresenter } from './moderator-update-user.presenter';
import { Roles } from '@/infra/web/auth/decorators/roles.decorator';
import { ModeratorUpdateUserUsecase } from '@/usecases/user/moderator-update/moderator-update-user.usecase';

@Controller('/users')
export class ModeratorUpdateUserRoute {
  constructor(
    private readonly moderatorUpdateUserUsecase: ModeratorUpdateUserUsecase,
  ) {}

  /**
   * Moderador editar parcialmente usuários (apenas moderadores/admins)
   * PATCH /users/:id/moderate
   */
  @Patch('/:id/moderate')
  @Roles('ADMIN', 'MODERATOR')
  public async handle(
    @Param('id') targetUserId: string,
    @Body() request: ModeratorUpdateUserRequest,
    @Req() req: Request,
  ): Promise<ModeratorUpdateUserResponse> {
    const moderatorId = req['userId'];
    const moderatorRoles = req['user']?.roles || [];

    console.log(`🛡️ API: Moderador ${moderatorId} editando usuário ${targetUserId}`);

    // Validação básica
    if (request.isActive === false && (!request.reason || request.reason.trim().length === 0)) {
      throw new Error('Motivo é obrigatório ao desativar um usuário');
    }

    const output = await this.moderatorUpdateUserUsecase.execute({
      targetUserId,
      moderatorId,
      moderatorRoles,
      isActive: request.isActive,
      emailVerified: request.emailVerified,
      reason: request.reason,
    });

    console.log(`✅ API: Usuário ${output.user.name} atualizado pelo moderador ${output.moderator.name}`);
    console.log(`📝 Campos alterados: ${output.changedFields.join(', ') || 'nenhum'}`);

    return ModeratorUpdateUserPresenter.toHttp(output);
  }
}
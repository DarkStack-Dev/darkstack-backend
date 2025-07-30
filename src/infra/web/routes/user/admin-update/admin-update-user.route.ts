// src/infra/web/routes/user/admin-update/admin-update-user.route.ts

import { Controller, Put, Param, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { AdminUpdateUserRequest, AdminUpdateUserResponse } from './admin-update-user.dto';
import { AdminUpdateUserPresenter } from './admin-update-user.presenter';
import { Roles } from '@/infra/web/auth/decorators/roles.decorator';
import { AdminUpdateUserUsecase } from '@/usecases/user/admin-update/admin-update-user.usecase';

@Controller('/users')
export class AdminUpdateUserRoute {
  constructor(
    private readonly adminUpdateUserUsecase: AdminUpdateUserUsecase,
  ) {}

  /**
   * Admin editar qualquer usuário (apenas admins)
   * PUT /users/:id/admin
   */
  @Put('/:id/admin')
  @Roles('ADMIN')
  public async handle(
    @Param('id') targetUserId: string,
    @Body() request: AdminUpdateUserRequest,
    @Req() req: Request,
  ): Promise<AdminUpdateUserResponse> {
    const adminId = req['userId'];
    const adminRoles = req['user']?.roles || [];

    console.log(`🛡️ API: Admin ${adminId} editando usuário ${targetUserId}`);

    const output = await this.adminUpdateUserUsecase.execute({
      targetUserId,
      adminId,
      adminRoles,
      name: request.name,
      email: request.email,
      avatar: request.avatar,
      roles: request.roles,
      isActive: request.isActive,
      emailVerified: request.emailVerified,
      newPassword: request.newPassword,
      forcePasswordChange: request.forcePasswordChange,
    });

    console.log(`✅ API: Usuário ${output.user.name} atualizado pelo admin ${output.admin.name}`);
    console.log(`📝 Campos alterados: ${output.changedFields.join(', ') || 'nenhum'}`);

    return AdminUpdateUserPresenter.toHttp(output);
  }
}
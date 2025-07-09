// src/infra/web/routes/user/update-profile/update-user-profile.route.ts

import { Controller, Put, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { UpdateUserProfileRequest, UpdateUserProfileResponse } from './update-user-profile.dto';
import { UpdateUserProfilePresenter } from './update-user-profile.presenter';
import { UpdateUserProfileUsecase } from '@/usecases/user/update-profile/update-user-profile.usecase';

@Controller('/users')
export class UpdateUserProfileRoute {
  constructor(
    private readonly updateUserProfileUsecase: UpdateUserProfileUsecase,
  ) {}

  /**
   * Atualizar perfil próprio (usuário autenticado)
   * PUT /users/profile
   */
  @Put('/profile')
  public async handle(
    @Body() request: UpdateUserProfileRequest,
    @Req() req: Request,
  ): Promise<UpdateUserProfileResponse> {
    const userId = req['userId']; // Vem do AuthGuard

    console.log(`👤 API: Atualizando perfil do usuário ${userId}`);

    const output = await this.updateUserProfileUsecase.execute({
      userId,
      name: request.name,
      email: request.email,
      avatar: request.avatar,
      currentPassword: request.currentPassword,
      newPassword: request.newPassword,
    });

    console.log(`✅ API: Perfil atualizado - campos alterados: ${output.changedFields.join(', ') || 'nenhum'}`);

    return UpdateUserProfilePresenter.toHttp(output);
  }
}
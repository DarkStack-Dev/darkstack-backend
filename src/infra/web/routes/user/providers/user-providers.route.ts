// src/infra/web/routes/user/providers/user-providers.route.ts - CORRIGIDA

import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { UserProvidersUseCase, UserProvidersOutput } from '@/domain/usecases/providers/user-providers.usecase';

export type UserProvidersResponse = UserProvidersOutput; // Reutilizar o tipo do Use Case

@Controller('/users')
export class UserProvidersRoute {
  constructor(
    private readonly userProvidersUseCase: UserProvidersUseCase, // ✅ Agora usa apenas o Use Case
  ) {}

  @Get('/providers')
  public async handle(@Req() req: Request): Promise<UserProvidersResponse> {
    const userId = req['userId']; // Vem do AuthGuard

    const result = await this.userProvidersUseCase.execute({ userId });
    
    return result; // Retorna diretamente, sem necessidade de presenter
  }
}
// src/infra/web/routes/user/providers/user-providers.route.ts - NOVO

import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { FindUserUsecase } from '@/usecases/user/find-by-id/find-user.usecase';
import { GitHubAccountGatewayRepository } from '@/domain/repositories/github-account/github-account.gateway.repository';

export type UserProvidersResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    roles: string[];
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
  };
  providers: {
    email: {
      hasPassword: boolean;
      verified: boolean;
    };
    github?: {
      id: string;
      username: string;
      bio?: string;
      publicRepos: number;
      followers: number;
      following: number;
      lastSyncAt: Date;
    };
    google?: {
      id: string;
      email: string;
    };
  };
};

@Controller('/users')
export class UserProvidersRoute {
  constructor(
    private readonly findUserUsecase: FindUserUsecase,
    private readonly githubAccountRepository: GitHubAccountGatewayRepository,
  ) {}

  @Get('/providers')
  public async handle(@Req() req: Request): Promise<UserProvidersResponse> {
    const userId = req['userId']; // Vem do AuthGuard

    console.log(`📋 Buscando provedores para userId: ${userId}`);

    // Buscar dados do usuário
    const userOutput = await this.findUserUsecase.execute({ id: userId });

    // Buscar conta GitHub se existir
    const githubAccount = await this.githubAccountRepository.findByUserId(userId);

    console.log(`🔍 Conta GitHub encontrada: ${!!githubAccount}`);

    const response: UserProvidersResponse = {
      user: {
        id: userOutput.id,
        name: userOutput.name,
        email: userOutput.email,
        roles: userOutput.roles,
        createdAt: userOutput.createdAt,
        updatedAt: userOutput.updatedAt,
      },
      providers: {
        email: {
          hasPassword: true, // TODO: Verificar se realmente tem senha (OAuth vs email/password)
          verified: true, // TODO: Implementar verificação de email
        },
        ...(githubAccount && {
          github: {
            id: githubAccount.getId(),
            username: githubAccount.getUsername(),
            bio: githubAccount.getBio(),
            publicRepos: githubAccount.getPublicRepos(),
            followers: githubAccount.getFollowers(),
            following: githubAccount.getFollowing(),
            lastSyncAt: githubAccount.getLastSyncAt(),
          },
        }),
        // TODO: Adicionar Google quando implementado
      },
    };

    console.log(`📤 Retornando dados dos provedores para: ${userOutput.email}`);

    return response;
  }
}
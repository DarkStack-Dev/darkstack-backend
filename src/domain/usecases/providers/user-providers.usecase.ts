// src/domain/usecases/user/providers/user-providers.usecase.ts

import { Injectable } from '@nestjs/common';
import { UseCase } from '@/domain/usecases/usecase';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { GitHubAccountGatewayRepository } from '@/domain/repositories/github-account/github-account.gateway.repository';
import { GoogleAccountGatewayRepository } from '@/domain/repositories/google-account/google-account.gateway.repository';
import { UserNotFoundUsecaseException } from '@/domain/usecases/exceptions/user/user-not-found.usecase.exception';

export type UserProvidersInput = {
  userId: string;
};

export type UserProvidersOutput = {
  user: {
    id: string;
    name: string;
    email: string;
    roles: string[];
    avatar?: string;
    createdAt: Date;
    updatedAt: Date;
    emailVerified: boolean;
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
      picture?: string;
      locale?: string;
      lastSyncAt: Date;
    };
  };
};

@Injectable()
export class UserProvidersUseCase implements UseCase<UserProvidersInput, UserProvidersOutput> {
  constructor(
    private readonly userRepository: UserGatewayRepository,
    private readonly githubAccountRepository: GitHubAccountGatewayRepository,
    private readonly googleAccountRepository: GoogleAccountGatewayRepository,
  ) {}

  public async execute({ userId }: UserProvidersInput): Promise<UserProvidersOutput> {
    console.log(`📋 Buscando provedores para userId: ${userId}`);

    // 1. Buscar dados do usuário
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundUsecaseException(
        `User not found with id ${userId} in ${UserProvidersUseCase.name}`,
        'Usuário não encontrado',
        UserProvidersUseCase.name,
      );
    }

    // 2. Buscar conta GitHub se existir
    const githubAccount = await this.githubAccountRepository.findByUserId(userId);
    console.log(`🔍 Conta GitHub encontrada: ${!!githubAccount}`);

    // 3. Buscar conta Google se existir
    const googleAccount = await this.googleAccountRepository.findByUserId(userId);
    console.log(`🔍 Conta Google encontrada: ${!!googleAccount}`);

    // 4. Verificar se tem senha (usuários OAuth podem não ter senha)
    const hasPassword = !user.isOAuthUser(); // Se não é OAuth, tem senha
    
    const result: UserProvidersOutput = {
      user: {
        id: user.getId(),
        name: user.getName(),
        email: user.getEmail(),
        roles: user.getRoles(),
        avatar: user.getAvatar(),
        createdAt: user.getCreatedAt(),
        updatedAt: user.getUpdatedAt(),
        emailVerified: user.isEmailVerified(),
      },
      providers: {
        email: {
          hasPassword,
          verified: user.isEmailVerified(),
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
        ...(googleAccount && {
          google: {
            id: googleAccount.getId(),
            email: googleAccount.getGoogleEmail(),
            picture: googleAccount.getPicture(),
            locale: googleAccount.getLocale(),
            lastSyncAt: googleAccount.getLastSyncAt(),
          },
        }),
      },
    };

    console.log(`📤 Retornando dados dos provedores para: ${user.getEmail()}`);
    return result;
  }
}
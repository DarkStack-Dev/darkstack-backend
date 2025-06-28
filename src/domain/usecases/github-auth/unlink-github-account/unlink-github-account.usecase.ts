// src/domain/usecases/github-auth/unlink-github-account/unlink-github-account.usecase.ts
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { GitHubAccountGatewayRepository } from '@/domain/repositories/github-account/github-account.gateway.repository';
import { UserNotFoundUsecaseException } from '../../exceptions/user/user-not-found.usecase.exception';

export type UnlinkGitHubAccountInput = {
  userId: string;
}

export type UnlinkGitHubAccountOutput = {
  success: boolean;
}

@Injectable()
export class UnlinkGitHubAccountUseCase implements UseCase<UnlinkGitHubAccountInput, UnlinkGitHubAccountOutput> {
  constructor(
    private readonly userGatewayRepository: UserGatewayRepository,
    private readonly githubAccountGatewayRepository: GitHubAccountGatewayRepository,
  ) {}

  public async execute({ userId }: UnlinkGitHubAccountInput): Promise<UnlinkGitHubAccountOutput> {
    // 1. Verificar se usuário existe
    const user = await this.userGatewayRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundUsecaseException(
        `User not found with id ${userId} in ${UnlinkGitHubAccountUseCase.name}`,
        'Usuário não encontrado',
        UnlinkGitHubAccountUseCase.name,
      );
    }

    // 2. Remover vinculação
    await this.githubAccountGatewayRepository.deleteByUserId(userId);

    return {
      success: true,
    };
  }
}
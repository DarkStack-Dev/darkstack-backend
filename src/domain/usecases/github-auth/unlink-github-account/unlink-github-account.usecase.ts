// src/domain/usecases/github-auth/unlink-github-account/unlink-github-account.usecase.ts - MELHORADO

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
    console.log(`🔗 Iniciando desvinculação de conta GitHub para userId: ${userId}`);

    // 1. Verificar se usuário existe
    const user = await this.userGatewayRepository.findById(userId);
    if (!user) {
      console.log(`❌ Usuário não encontrado: ${userId}`);
      throw new UserNotFoundUsecaseException(
        `User not found with id ${userId} in ${UnlinkGitHubAccountUseCase.name}`,
        'Usuário não encontrado',
        UnlinkGitHubAccountUseCase.name,
      );
    }

    console.log(`✅ Usuário encontrado: ${user.getEmail()}`);

    // 2. Verificar se existe conta GitHub vinculada
    const existingGitHubAccount = await this.githubAccountGatewayRepository.findByUserId(userId);
    if (!existingGitHubAccount) {
      console.log(`⚠️ Nenhuma conta GitHub vinculada encontrada para userId: ${userId}`);
      // Ainda retorna sucesso, pois o objetivo (não ter conta vinculada) foi alcançado
      return {
        success: true,
      };
    }

    console.log(`🔍 Conta GitHub encontrada: @${existingGitHubAccount.getUsername()}`);

    // 3. Remover vinculação
    try {
      await this.githubAccountGatewayRepository.deleteByUserId(userId);
      console.log(`✅ Conta GitHub desvinculada com sucesso para userId: ${userId}`);
      
      return {
        success: true,
      };
    } catch (error) {
      console.log(`❌ Erro ao desvincular conta GitHub para userId: ${userId}`, error);
      throw new Error(`Erro ao desvincular conta GitHub: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}
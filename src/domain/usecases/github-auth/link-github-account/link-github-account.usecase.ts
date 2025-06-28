// src/domain/usecases/github-auth/link-github-account/link-github-account.usecase.ts
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { GitHubService } from '@/infra/services/github/github.service';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { GitHubAccountGatewayRepository } from '@/domain/repositories/github-account/github-account.gateway.repository';
import { GitHubAccount } from '@/domain/entities/github-account/github-account.entity';
import { UserNotFoundUsecaseException } from '../../exceptions/user/user-not-found.usecase.exception';

export type LinkGitHubAccountInput = {
  userId: string;
  code: string;
}

export type LinkGitHubAccountOutput = {
  success: boolean;
  githubAccount: {
    id: string;
    username: string;
    bio?: string;
  };
}

@Injectable()
export class LinkGitHubAccountUseCase implements UseCase<LinkGitHubAccountInput, LinkGitHubAccountOutput> {
  constructor(
    private readonly githubService: GitHubService,
    private readonly userGatewayRepository: UserGatewayRepository,
    private readonly githubAccountGatewayRepository: GitHubAccountGatewayRepository,
  ) {}

  public async execute({ userId, code }: LinkGitHubAccountInput): Promise<LinkGitHubAccountOutput> {
    // 1. Verificar se usuário existe
    const user = await this.userGatewayRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundUsecaseException(
        `User not found with id ${userId} in ${LinkGitHubAccountUseCase.name}`,
        'Usuário não encontrado',
        LinkGitHubAccountUseCase.name,
      );
    }

    // 2. Verificar se já tem conta GitHub vinculada
    const existingGithubAccount = await this.githubAccountGatewayRepository.findByUserId(userId);
    if (existingGithubAccount) {
      throw new Error('User already has a GitHub account linked');
    }

    // 3. Trocar código por token
    const tokenData = await this.githubService.exchangeCodeForToken(code);
    
    // 4. Buscar dados do GitHub
    const githubUserData = await this.githubService.getUserData(tokenData.access_token);

    // 5. Verificar se conta GitHub já está vinculada a outro usuário
    const existingGithubAccountByGithubId = await this.githubAccountGatewayRepository.findByGithubId(githubUserData.id.toString());
    if (existingGithubAccountByGithubId) {
      throw new Error('GitHub account is already linked to another user');
    }

    // 6. Criar vinculação
    const githubAccount = GitHubAccount.create({
      userId: user.getId(),
      githubId: githubUserData.id.toString(),
      username: githubUserData.login,
      bio: githubUserData.bio || undefined,
      publicRepos: githubUserData.public_repos,
      followers: githubUserData.followers,
      following: githubUserData.following,
      githubAccessToken: tokenData.access_token,
      githubRefreshToken: tokenData.refresh_token,
      tokenExpiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : undefined,
    });

    await this.githubAccountGatewayRepository.create(githubAccount);

    return {
      success: true,
      githubAccount: {
        id: githubAccount.getId(),
        username: githubAccount.getUsername(),
        bio: githubAccount.getBio(),
      },
    };
  }
}
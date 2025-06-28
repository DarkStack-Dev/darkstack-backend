// src/domain/usecases/auth/github-callback/github-callback.usecase.ts - CORRIGIDO v2

import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { GitHubApiService } from '@/infra/services/github/github-api/github-api.service';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { GitHubAccountGatewayRepository } from '@/domain/repositories/github-account/github-account.gateway.repository';
import { JwtService } from '@/infra/services/jwt/jwt.service';
import { User } from '@/domain/entities/user/user.entitty';
import { GitHubAccount } from '@/domain/entities/github-account/github-account.entity';
import { UserRole } from 'generated/prisma';

export type GitHubCallbackInput = {
  code: string;
  state?: string;
};

export type GitHubCallbackOutput = {
  authToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    roles: UserRole[];
    isActive: boolean;
  };
  isNewUser: boolean;
};

@Injectable()
export class GitHubCallbackUseCase implements UseCase<GitHubCallbackInput, GitHubCallbackOutput> {
  constructor(
    private readonly githubApiService: GitHubApiService,
    private readonly userRepository: UserGatewayRepository,
    private readonly githubAccountRepository: GitHubAccountGatewayRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute({ code }: GitHubCallbackInput): Promise<GitHubCallbackOutput> {
    // 1. Trocar código por token (APENAS UMA VEZ!)
    const tokenData = await this.githubApiService.exchangeCodeForToken(code);
    
    // 2. Buscar dados do usuário usando o token obtido
    const githubUserData = await this.githubApiService.getGitHubUserData(tokenData.accessToken);
    
    // 3. Buscar emails do usuário
    const githubEmails = await this.githubApiService.getGitHubUserEmails(tokenData.accessToken);
    const primaryEmail = githubEmails.find(email => email.primary);
    
    if (!primaryEmail) {
      throw new Error('No primary email found for GitHub user');
    }

    let user: User | null;
    let isNewUser = false;

    // 4. Verificar se já existe uma conta GitHub vinculada
    let existingGitHubAccount = await this.githubAccountRepository.findByGithubId(githubUserData.id.toString());
    
    if (existingGitHubAccount) {
      // Conta GitHub já existe, buscar o usuário
      user = await this.userRepository.findById(existingGitHubAccount.getUserId());
      if (!user) {
        throw new Error('User not found for existing GitHub account');
      }
      
      // Atualizar tokens da conta GitHub (método correto: updateTokens)
      existingGitHubAccount.updateTokens(
        tokenData.accessToken,
        undefined, // GitHub OAuth não retorna refresh token
        undefined  // GitHub OAuth não retorna expiração
      );
      
      // Atualizar perfil da conta GitHub (parâmetros individuais)
      existingGitHubAccount.updateProfile(
        githubUserData.bio || undefined,       // Converter null para undefined
        githubUserData.publicRepos,
        githubUserData.followers,
        githubUserData.following
      );
      
      await this.githubAccountRepository.update(existingGitHubAccount);
    } else {
      // Verificar se já existe um usuário com este email
      const existingUser = await this.userRepository.findByEmail(primaryEmail.email);
      
      if (existingUser) {
        // Usuário já existe, vincular conta GitHub
        user = existingUser;
        
        const githubAccount = GitHubAccount.create({
          userId: user.getId(),
          githubId: githubUserData.id.toString(),
          username: githubUserData.login,
          bio: githubUserData.bio || undefined,  // Converter null para undefined
          publicRepos: githubUserData.publicRepos,
          followers: githubUserData.followers,
          following: githubUserData.following,
          githubAccessToken: tokenData.accessToken,
          githubRefreshToken: undefined,  // GitHub OAuth não retorna refresh token
          tokenExpiresAt: undefined,      // GitHub OAuth não retorna expiração
        });
        
        await this.githubAccountRepository.create(githubAccount);
      } else {
        // Criar novo usuário
        isNewUser = true;
        
        user = User.create({
          name: githubUserData.name || githubUserData.login,
          email: primaryEmail.email,
          password: '', // Usuários GitHub não têm senha
          roles: [UserRole.USER],
        });
        
        await this.userRepository.create(user);
        
        // Criar conta GitHub vinculada
        const githubAccount = GitHubAccount.create({
          userId: user.getId(),
          githubId: githubUserData.id.toString(),
          username: githubUserData.login,
          bio: githubUserData.bio || undefined,  // Converter null para undefined
          publicRepos: githubUserData.publicRepos,
          followers: githubUserData.followers,
          following: githubUserData.following,
          githubAccessToken: tokenData.accessToken,
          githubRefreshToken: undefined,  // GitHub OAuth não retorna refresh token
          tokenExpiresAt: undefined,      // GitHub OAuth não retorna expiração
        });
        
        await this.githubAccountRepository.create(githubAccount);
      }
    }

    // 5. Gerar tokens JWT
    const authToken = this.jwtService.generateAuthToken(user.getId(), user.getRoles());
    const refreshToken = this.jwtService.generateRefreshToken(user.getId(), user.getRoles());

    return {
      authToken,
      refreshToken,
      user: {
        id: user.getId(),
        name: user.getName(),
        email: user.getEmail(),
        roles: user.getRoles(),
        isActive: user.getIsActivate(),
      },
      isNewUser, // isNewUser está no nível raiz, não dentro de user
    };
  }
}
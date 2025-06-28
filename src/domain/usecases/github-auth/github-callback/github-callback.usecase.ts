// src/domain/usecases/github-auth/github-callback/github-callback.usecase.ts - CORRIGIDO v3

import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { GitHubService } from '@/infra/services/github/github.service';
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
    private readonly githubService: GitHubService,
    private readonly userRepository: UserGatewayRepository,
    private readonly githubAccountRepository: GitHubAccountGatewayRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute({ code }: GitHubCallbackInput): Promise<GitHubCallbackOutput> {
    try {
      // 1. Trocar código por token
      console.log('🔄 Step 1: Exchanging code for token...');
      const tokenData = await this.githubService.exchangeCodeForToken(code);
      
      // 2. Buscar dados do usuário
      console.log('👤 Step 2: Getting user data...');
      const githubUserData = await this.githubService.getUserData(tokenData.access_token);
      
      // 3. Buscar email (público ou privado)
      console.log('📧 Step 3: Getting user email...');
      let email = githubUserData.email;
      
      if (!email) {
        console.log('📧 No public email, fetching private emails...');
        const emails = await this.githubService.getUserEmails(tokenData.access_token);
        const primaryEmail = emails.find(e => e.primary && e.verified);
        
        if (!primaryEmail) {
          throw new Error('No verified primary email found for GitHub user');
        }
        
        email = primaryEmail.email;
        console.log('📧 Found primary email:', email);
      }

      let user: User | null;
      let isNewUser = false;

      // 4. Verificar se já existe uma conta GitHub vinculada
      console.log('🔍 Step 4: Checking existing GitHub account...');
      let existingGitHubAccount = await this.githubAccountRepository.findByGithubId(githubUserData.id.toString());
      
      if (existingGitHubAccount) {
        console.log('✅ Existing GitHub account found, updating...');
        // Conta GitHub já existe, buscar o usuário
        user = await this.userRepository.findById(existingGitHubAccount.getUserId());
        if (!user) {
          throw new Error('User not found for existing GitHub account');
        }
        
        // Atualizar tokens da conta GitHub
        existingGitHubAccount.updateTokens(
          tokenData.access_token,
          tokenData.refresh_token,
          tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : undefined
        );
        
        // Atualizar perfil da conta GitHub
        existingGitHubAccount.updateProfile(
          githubUserData.bio || undefined,
          githubUserData.public_repos,
          githubUserData.followers,
          githubUserData.following
        );
        
        await this.githubAccountRepository.update(existingGitHubAccount);
      } else {
        // Verificar se já existe um usuário com este email
        console.log('🔍 Step 5: Checking existing user by email...');
        const existingUser = await this.userRepository.findByEmail(email);
        
        if (existingUser) {
          console.log('✅ Existing user found, linking GitHub account...');
          // Usuário já existe, vincular conta GitHub
          user = existingUser;
          
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
          
          await this.githubAccountRepository.create(githubAccount);
        } else {
          console.log('🆕 Creating new user...');
          // Criar novo usuário
          isNewUser = true;
          
          user = User.create({
            name: githubUserData.name || githubUserData.login,
            email: email,
            password: '', // Usuários GitHub não têm senha
            roles: [UserRole.USER],
            isOAuthUser: true,
          });
          
          await this.userRepository.create(user);
          
          // Criar conta GitHub vinculada
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
          
          await this.githubAccountRepository.create(githubAccount);
        }
      }

      // 5. Gerar tokens JWT
      console.log('🔑 Step 6: Generating JWT tokens...');
      const authToken = this.jwtService.generateAuthToken(user.getId(), user.getRoles());
      const refreshToken = this.jwtService.generateRefreshToken(user.getId(), user.getRoles());

      console.log('✅ GitHub authentication completed successfully!');
      
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
        isNewUser,
      };
    } catch (error) {
      console.log('❌ GitHub callback error:', error);
      throw error;
    }
  }
}
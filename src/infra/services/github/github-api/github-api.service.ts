// src/infra/services/github/github-api/github-api.service.ts - CORRIGIDO

import { Injectable } from '@nestjs/common';
import { ServiceException } from '../../exceptions/service.exception';

export type GitHubTokenData = {
  accessToken: string;
  tokenType: string;
  scope: string;
};

export type GitHubUserData = {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  bio: string | null;
  publicRepos: number;
  followers: number;
  following: number;
};

export type GitHubEmailData = {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
};

@Injectable()
export class GitHubApiService {
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor() {
    this.clientId = process.env.GITHUB_CLIENT_ID!;
    this.clientSecret = process.env.GITHUB_CLIENT_SECRET!;

    if (!this.clientId || !this.clientSecret) {
      throw new ServiceException(
        'GitHub OAuth credentials not configured',
        'Configuração do GitHub não encontrada',
        GitHubApiService.name,
      );
    }
  }

  /**
   * Troca o código OAuth por um token de acesso
   */
  async exchangeCodeForToken(code: string): Promise<GitHubTokenData> {
    const tokenRequest = {
      client_id: this.clientId,
      code,
      redirect_uri: 'http://localhost:3000/auth/github/callback',
      client_secret: this.clientSecret,
    };

    console.log('📤 GitHub Token Exchange Request:', {
      ...tokenRequest,
      client_secret: '***hidden***'
    });

    try {
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokenRequest),
      });

      console.log('📥 GitHub Response Status:', response.status);

      if (!response.ok) {
        throw new ServiceException(
          `GitHub API returned ${response.status}: ${response.statusText}`,
          'Erro ao autenticar com GitHub',
          GitHubApiService.name,
        );
      }

      const data = await response.json();
      console.log('📥 GitHub Token Response:', {
        hasAccessToken: !!data.access_token,
        tokenType: data.token_type,
        scope: data.scope,
        hasError: !!data.error
      });

      // Se houver erro na resposta
      if (data.error) {
        console.log('❌ GitHub Token Exchange Error:', JSON.stringify(data, null, 2));
        throw new ServiceException(
          `GitHub token exchange returned error: ${JSON.stringify(data)}`,
          'Erro ao obter token de acesso do GitHub',
          GitHubApiService.name,
        );
      }

      // Se não houver access_token
      if (!data.access_token) {
        console.log('❌ GitHub Token Exchange Error:', JSON.stringify(data, null, 2));
        throw new ServiceException(
          `GitHub token exchange returned no access_token: ${JSON.stringify(data)}`,
          'Erro ao obter token de acesso do GitHub',
          GitHubApiService.name,
        );
      }

      return {
        accessToken: data.access_token,
        tokenType: data.token_type || 'bearer',
        scope: data.scope || '',
      };
    } catch (error) {
      if (error instanceof ServiceException) {
        throw error;
      }

      throw new ServiceException(
        `Failed to exchange GitHub code for token: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Erro ao autenticar com GitHub',
        GitHubApiService.name,
      );
    }
  }

  /**
   * Busca dados do usuário do GitHub usando o token
   * IMPORTANTE: Use o token já obtido, não tente trocar o código novamente!
   */
  async getGitHubUserData(accessToken: string): Promise<GitHubUserData> {
    console.log('👤 Getting GitHub user data...');
    
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'DarkStack-App',
        },
      });

      if (!response.ok) {
        throw new ServiceException(
          `GitHub API returned ${response.status}: ${response.statusText}`,
          'Erro ao buscar dados do usuário no GitHub',
          GitHubApiService.name,
        );
      }

      const userData = await response.json();
      console.log('👤 GitHub User Data:', {
        id: userData.id,
        login: userData.login,
        name: userData.name,
        hasEmail: !!userData.email
      });

      return {
        id: userData.id,
        login: userData.login,
        name: userData.name,
        email: userData.email,
        bio: userData.bio,
        publicRepos: userData.public_repos || 0,
        followers: userData.followers || 0,
        following: userData.following || 0,
      };
    } catch (error) {
      if (error instanceof ServiceException) {
        throw error;
      }

      throw new ServiceException(
        `Failed to fetch GitHub user data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Erro ao buscar dados do usuário no GitHub',
        GitHubApiService.name,
      );
    }
  }

  /**
   * Busca emails do usuário do GitHub
   */
  async getGitHubUserEmails(accessToken: string): Promise<GitHubEmailData[]> {
    console.log('📧 Fetching GitHub user emails...');
    
    try {
      const response = await fetch('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'DarkStack-App',
        },
      });

      if (!response.ok) {
        throw new ServiceException(
          `GitHub API returned ${response.status}: ${response.statusText}`,
          'Erro ao buscar emails do usuário no GitHub',
          GitHubApiService.name,
        );
      }

      const emails = await response.json();
      const primaryEmail = emails.find((email: any) => email.primary);
      
      if (primaryEmail) {
        console.log('📧 Found primary email:', primaryEmail.email);
      }

      return emails.map((email: any) => ({
        email: email.email,
        primary: email.primary,
        verified: email.verified,
        visibility: email.visibility,
      }));
    } catch (error) {
      if (error instanceof ServiceException) {
        throw error;
      }

      throw new ServiceException(
        `Failed to fetch GitHub user emails: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Erro ao buscar emails do usuário no GitHub',
        GitHubApiService.name,
      );
    }
  }
}
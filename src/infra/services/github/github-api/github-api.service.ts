// src/infra/services/github/github-api/github-api.service.ts - ATUALIZADO
import { Injectable } from '@nestjs/common';
import { GitHubService, GitHubEmailData } from '../github.service';
import { GitHubUserData, GitHubTokenResponse } from '../types';
import { ServiceException } from '../../exceptions/service.exception';

@Injectable()
export class GitHubApiService extends GitHubService {
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor() {
    super();
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

  async exchangeCodeForToken(code: string): Promise<GitHubTokenResponse> {
    const tokenRequest = {
      client_id: this.clientId,
      code,
      redirect_uri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/auth/github/callback',
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

      if (data.error) {
        console.log('❌ GitHub Token Exchange Error:', JSON.stringify(data, null, 2));
        throw new ServiceException(
          `GitHub token exchange returned error: ${JSON.stringify(data)}`,
          'Erro ao obter token de acesso do GitHub',
          GitHubApiService.name,
        );
      }

      if (!data.access_token) {
        console.log('❌ GitHub Token Exchange Error:', JSON.stringify(data, null, 2));
        throw new ServiceException(
          `GitHub token exchange returned no access_token: ${JSON.stringify(data)}`,
          'Erro ao obter token de acesso do GitHub',
          GitHubApiService.name,
        );
      }

      return {
        access_token: data.access_token,
        token_type: data.token_type || 'bearer',
        scope: data.scope || '',
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
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

  async getUserData(accessToken: string): Promise<GitHubUserData> {
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
        avatar_url: userData.avatar_url,
        bio: userData.bio,
        public_repos: userData.public_repos || 0,
        followers: userData.followers || 0,
        following: userData.following || 0,
        email: userData.email,
        name: userData.name,
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

  async getUserEmails(accessToken: string): Promise<GitHubEmailData[]> {
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
      console.log('📧 GitHub Emails found:', emails.length);
      
      const primaryEmail = emails.find((email: any) => email.primary);
      if (primaryEmail) {
        console.log('📧 Primary email found:', primaryEmail.email);
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

  getAuthorizationUrl(state?: string): string {
    const clientId = this.clientId;
    const redirectUri = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/auth/github/callback';
    const scope = 'user:email'; // Scope necessário para acessar emails
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scope,
    });
    
    if (state) {
      params.append('state', state);
    }
    
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }
}
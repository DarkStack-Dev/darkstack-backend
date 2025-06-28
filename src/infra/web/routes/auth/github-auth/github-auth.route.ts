// src/infra/web/routes/auth/github-auth/github-auth.route.ts

import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { IsPublic } from '@/infra/web/auth/decorators/is-public.decorator';

@Controller('/auth/github')
export class GitHubAuthRoute {
  private readonly clientId: string;
  private readonly redirectUri: string;

  constructor() {
    this.clientId = process.env.GITHUB_CLIENT_ID!;
    this.redirectUri = process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/auth/github/callback';

    if (!this.clientId) {
      throw new Error('GITHUB_CLIENT_ID environment variable is required');
    }
  }

  /**
   * Redireciona o usuário para o GitHub OAuth
   * GET /auth/github
   */
  @IsPublic()
  @Get()
  async authenticate(@Res() response: Response) {
    const state = this.generateState();
    const scopes = ['user:email', 'read:user'];
    
    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.set('client_id', this.clientId);
    githubAuthUrl.searchParams.set('redirect_uri', this.redirectUri);
    githubAuthUrl.searchParams.set('scope', scopes.join(' '));
    githubAuthUrl.searchParams.set('state', state);

    console.log('🚀 GitHub Auth URL:', githubAuthUrl.toString());

    return response.redirect(githubAuthUrl.toString());
  }

  /**
   * Retorna a URL de autenticação do GitHub (para uso do frontend)
   * GET /auth/github/url
   */
  @IsPublic()
  @Get('/url')
  async getAuthUrl() {
    const state = this.generateState();
    const scopes = ['user:email', 'read:user'];
    
    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.set('client_id', this.clientId);
    githubAuthUrl.searchParams.set('redirect_uri', this.redirectUri);
    githubAuthUrl.searchParams.set('scope', scopes.join(' '));
    githubAuthUrl.searchParams.set('state', state);

    return {
      url: githubAuthUrl.toString(),
      state,
    };
  }

  private generateState(): string {
    return 'login'; // Você pode usar algo mais robusto como crypto.randomBytes(32).toString('hex')
  }
}
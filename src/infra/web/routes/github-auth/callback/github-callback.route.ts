// src/infra/web/routes/auth/github-callback/github-callback.route.ts - CORRIGIDA

import { Controller, Get, Post, Query, Res, Body } from '@nestjs/common';
import { Response } from 'express';
import { IsPublic } from '@/infra/web/auth/decorators/is-public.decorator';
import { GitHubCallbackUseCase } from '@/domain/usecases/github-auth/github-callback/github-callback.usecase';
import { GitHubCallbackRequest, GitHubCallbackResponse } from './github-callback.dto';
import { GitHubCallbackPresenter } from './github-callback.presenter';

@Controller('/auth/github')
export class GitHubCallbackRoute {
  constructor(private readonly githubCallbackUseCase: GitHubCallbackUseCase) {}

  /**
   * Endpoint para o callback do GitHub OAuth
   * GitHub redireciona para esta rota após autorização
   */
  @IsPublic()
  @Get('/callback')
  async handleGet(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() response: Response,
  ) {
    console.log('📍 GitHub Callback GET received:', { 
      hasCode: !!code, 
      hasState: !!state, 
      hasError: !!error 
    });

    // Se houver erro do GitHub
    if (error) {
      console.log('❌ GitHub OAuth Error:', error);
      return response.redirect(
        `${process.env.FRONTEND_URL}/auth/signin?error=github_auth_failed`
      );
    }

    // Se não houver código
    if (!code) {
      console.log('❌ No authorization code received');
      return response.redirect(
        `${process.env.FRONTEND_URL}/auth/signin?error=no_code`
      );
    }

    try {
      const result = await this.githubCallbackUseCase.execute({ code, state });
      
      console.log('✅ GitHub authentication successful:', {
        userId: result.user.id,
        email: result.user.email,
        isNewUser: result.isNewUser
      });

      // Redirecionar para o frontend com os tokens
      const redirectUrl = new URL(`${process.env.FRONTEND_URL}/auth/github/success`);
      redirectUrl.searchParams.set('token', result.authToken);
      redirectUrl.searchParams.set('refresh', result.refreshToken);
      redirectUrl.searchParams.set('isNewUser', result.isNewUser.toString());

      return response.redirect(redirectUrl.toString());
    } catch (error) {
      console.log('❌ GitHub callback error:', error);
      
      return response.redirect(
        `${process.env.FRONTEND_URL}/auth/signin?error=callback_failed`
      );
    }
  }

  /**
   * Endpoint alternativo para receber dados via POST
   * Útil para casos onde o frontend precisa processar os dados
   */
  @IsPublic()
  @Post('/callback')
  async handlePost(@Body() request: GitHubCallbackRequest): Promise<GitHubCallbackResponse> {
    console.log('📍 GitHub Callback POST received:', { 
      hasCode: !!request.code, 
      hasState: !!request.state 
    });

    if (!request.code) {
      throw new Error('Authorization code is required');
    }

    try {
      const result = await this.githubCallbackUseCase.execute(request);
      
      console.log('✅ GitHub authentication successful:', {
        userId: result.user.id,
        email: result.user.email,
        isNewUser: result.isNewUser
      });

      return GitHubCallbackPresenter.toHttp(result);
    } catch (error) {
      console.log('❌ GitHub callback error:', error);
      throw error;
    }
  }
}
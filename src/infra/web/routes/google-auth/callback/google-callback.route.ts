// src/infra/web/routes/google-auth/callback/google-callback.route.ts
import { Controller, Get, Post, Query, Res, Body } from '@nestjs/common';
import { Response } from 'express';
import { IsPublic } from '@/infra/web/auth/decorators/is-public.decorator';
import { GoogleCallbackUseCase } from '@/domain/usecases/google-auth/google-callback/google-callback.usecase';
import { GoogleCallbackRequest, GoogleCallbackResponse } from './google-callback.dto';
import { GoogleCallbackPresenter } from './google-callback.presenter';

@Controller('/auth/google')
export class GoogleCallbackRoute {
  constructor(private readonly googleCallbackUseCase: GoogleCallbackUseCase) {}

  /**
   * Endpoint para o callback do Google OAuth
   * Google redireciona para esta rota após autorização
   */
  @IsPublic()
  @Get('/callback')
  async handleGet(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() response: Response,
  ) {
    console.log('📍 Google Callback GET received:', { 
      hasCode: !!code, 
      hasState: !!state, 
      hasError: !!error 
    });

    // Se houver erro do Google
    if (error) {
      console.log('❌ Google OAuth Error:', error);
      return response.redirect(
        `${process.env.FRONTEND_URL}/auth/signin?error=google_auth_failed`
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
      const result = await this.googleCallbackUseCase.execute({ code, state });
      
      console.log('✅ Google authentication successful:', {
        userId: result.user.id,
        email: result.user.email,
        isNewUser: result.isNewUser
      });

      // Redirecionar para o frontend com os tokens
      const redirectUrl = new URL(`${process.env.FRONTEND_URL}/auth/google/success`);
      redirectUrl.searchParams.set('token', result.authToken);
      redirectUrl.searchParams.set('refresh', result.refreshToken);
      redirectUrl.searchParams.set('isNewUser', result.isNewUser.toString());

      return response.redirect(redirectUrl.toString());
    } catch (error) {
      console.log('❌ Google callback error:', error);
      
      return response.redirect(
        `${process.env.FRONTEND_URL}/auth/signin?error=callback_failed`
      );
    }
  }

  /**
   * Endpoint alternativo para receber dados via POST
   */
  @IsPublic()
  @Post('/callback')
  async handlePost(@Body() request: GoogleCallbackRequest): Promise<GoogleCallbackResponse> {
    console.log('📍 Google Callback POST received:', { 
      hasCode: !!request.code, 
      hasState: !!request.state 
    });

    if (!request.code) {
      throw new Error('Authorization code is required');
    }

    try {
      const result = await this.googleCallbackUseCase.execute(request);
      
      console.log('✅ Google authentication successful:', {
        userId: result.user.id,
        email: result.user.email,
        isNewUser: result.isNewUser
      });

      return GoogleCallbackPresenter.toHttp(result);
    } catch (error) {
      console.log('❌ Google callback error:', error);
      throw error;
    }
  }
}
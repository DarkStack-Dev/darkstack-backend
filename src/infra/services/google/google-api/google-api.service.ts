// src/infra/services/google/google-api/google-api.service.ts

import { Injectable } from '@nestjs/common';
import { ServiceException } from '../../exceptions/service.exception';

export type GoogleTokenData = {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
};

export type GoogleUserData = {
  id: string;
  email: string;
  name: string;
  picture: string;
  locale: string;
  verified_email: boolean;
};

@Injectable()
export class GoogleApiService {
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID!;
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET!;

    if (!this.clientId || !this.clientSecret) {
      throw new ServiceException(
        'Google OAuth credentials not configured',
        'Configuração do Google não encontrada',
        GoogleApiService.name,
      );
    }
  }

  /**
   * Troca o código OAuth por um token de acesso
   */
  async exchangeCodeForToken(code: string): Promise<GoogleTokenData> {
    const tokenRequest = {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: 'http://localhost:3000/auth/google/callback',
    };

    console.log('📤 Google Token Exchange Request:', {
      ...tokenRequest,
      client_secret: '***hidden***'
    });

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(tokenRequest),
      });

      console.log('📥 Google Response Status:', response.status);

      if (!response.ok) {
        throw new ServiceException(
          `Google API returned ${response.status}: ${response.statusText}`,
          'Erro ao autenticar com Google',
          GoogleApiService.name,
        );
      }

      const data = await response.json();
      console.log('📥 Google Token Response:', {
        hasAccessToken: !!data.access_token,
        tokenType: data.token_type,
        scope: data.scope,
        hasError: !!data.error
      });

      // Se houver erro na resposta
      if (data.error) {
        console.log('❌ Google Token Exchange Error:', JSON.stringify(data, null, 2));
        throw new ServiceException(
          `Google token exchange returned error: ${JSON.stringify(data)}`,
          'Erro ao obter token de acesso do Google',
          GoogleApiService.name,
        );
      }

      // Se não houver access_token
      if (!data.access_token) {
        console.log('❌ Google Token Exchange Error:', JSON.stringify(data, null, 2));
        throw new ServiceException(
          `Google token exchange returned no access_token: ${JSON.stringify(data)}`,
          'Erro ao obter token de acesso do Google',
          GoogleApiService.name,
        );
      }

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenType: data.token_type || 'Bearer',
        expiresIn: data.expires_in || 3600,
        scope: data.scope || '',
      };
    } catch (error) {
      if (error instanceof ServiceException) {
        throw error;
      }

      throw new ServiceException(
        `Failed to exchange Google code for token: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Erro ao autenticar com Google',
        GoogleApiService.name,
      );
    }
  }

  /**
   * Busca dados do usuário do Google usando o token
   */
  async getGoogleUserData(accessToken: string): Promise<GoogleUserData> {
    console.log('👤 Getting Google user data...');
    
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new ServiceException(
          `Google API returned ${response.status}: ${response.statusText}`,
          'Erro ao buscar dados do usuário no Google',
          GoogleApiService.name,
        );
      }

      const userData = await response.json();
      console.log('👤 Google User Data:', {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        verified: userData.verified_email
      });

      return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        locale: userData.locale,
        verified_email: userData.verified_email,
      };
    } catch (error) {
      if (error instanceof ServiceException) {
        throw error;
      }

      throw new ServiceException(
        `Failed to fetch Google user data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Erro ao buscar dados do usuário no Google',
        GoogleApiService.name,
      );
    }
  }
}
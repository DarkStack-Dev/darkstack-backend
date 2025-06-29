// src/domain/usecases/google-auth/start-google-auth/start-google-auth.usecase.ts

import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';

export type StartGoogleAuthInput = {
  state?: string;
}

export type StartGoogleAuthOutput = {
  authorizationUrl: string;
}

@Injectable()
export class StartGoogleAuthUseCase implements UseCase<StartGoogleAuthInput, StartGoogleAuthOutput> {
  private readonly clientId: string;
  private readonly redirectUri: string;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID!;
    this.redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';

    if (!this.clientId) {
      throw new Error('GOOGLE_CLIENT_ID environment variable is required');
    }
  }

  public async execute({ state }: StartGoogleAuthInput): Promise<StartGoogleAuthOutput> {
    const scopes = [
      'openid',
      'profile',
      'email'
    ].join(' ');

    const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/auth');
    authorizationUrl.searchParams.set('client_id', this.clientId);
    authorizationUrl.searchParams.set('redirect_uri', this.redirectUri);
    authorizationUrl.searchParams.set('scope', scopes);
    authorizationUrl.searchParams.set('response_type', 'code');
    authorizationUrl.searchParams.set('access_type', 'offline');
    authorizationUrl.searchParams.set('prompt', 'consent');
    
    if (state) {
      authorizationUrl.searchParams.set('state', state);
    }

    return {
      authorizationUrl: authorizationUrl.toString(),
    };
  }
}
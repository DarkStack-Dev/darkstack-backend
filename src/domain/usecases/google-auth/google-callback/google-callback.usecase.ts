// src/domain/usecases/google-auth/google-callback/google-callback.usecase.ts

import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { GoogleApiService } from '@/infra/services/google/google-api/google-api.service';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { GoogleAccountGatewayRepository } from '@/domain/repositories/google-account/google-account.gateway.repository';
import { JwtService } from '@/infra/services/jwt/jwt.service';
import { User } from '@/domain/entities/user/user.entitty';
import { GoogleAccount } from '@/domain/entities/google-account/google-account.entity';
import { UserRole } from 'generated/prisma';

export type GoogleCallbackInput = {
  code: string;
  state?: string;
};

export type GoogleCallbackOutput = {
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
export class GoogleCallbackUseCase implements UseCase<GoogleCallbackInput, GoogleCallbackOutput> {
  constructor(
    private readonly googleApiService: GoogleApiService,
    private readonly userRepository: UserGatewayRepository,
    private readonly googleAccountRepository: GoogleAccountGatewayRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute({ code }: GoogleCallbackInput): Promise<GoogleCallbackOutput> {
    // 1. Trocar código por token
    const tokenData = await this.googleApiService.exchangeCodeForToken(code);
    
    // 2. Buscar dados do usuário usando o token obtido
    const googleUserData = await this.googleApiService.getGoogleUserData(tokenData.accessToken);
    
    if (!googleUserData.verified_email) {
      throw new Error('Google email is not verified');
    }

    let user: User | null;
    let isNewUser = false;

    // 3. Verificar se já existe uma conta Google vinculada
    let existingGoogleAccount = await this.googleAccountRepository.findByGoogleId(googleUserData.id);
    
    if (existingGoogleAccount) {
      // Conta Google já existe, buscar o usuário
      user = await this.userRepository.findById(existingGoogleAccount.getUserId());
      if (!user) {
        throw new Error('User not found for existing Google account');
      }
      
      // Atualizar tokens da conta Google
      existingGoogleAccount.updateTokens(
        tokenData.accessToken,
        tokenData.refreshToken,
        tokenData.expiresIn ? new Date(Date.now() + tokenData.expiresIn * 1000) : undefined
      );
      
      // Atualizar perfil da conta Google
      existingGoogleAccount.updateProfile(
        googleUserData.picture,
        googleUserData.locale
      );
      
      await this.googleAccountRepository.update(existingGoogleAccount);
    } else {
      // Verificar se já existe um usuário com este email
      const existingUser = await this.userRepository.findByEmail(googleUserData.email);
      
      if (existingUser) {
        // Usuário já existe, vincular conta Google
        user = existingUser;
        
        const googleAccount = GoogleAccount.create({
          userId: user.getId(),
          googleId: googleUserData.id,
          googleEmail: googleUserData.email,
          picture: googleUserData.picture,
          locale: googleUserData.locale,
          googleAccessToken: tokenData.accessToken,
          googleRefreshToken: tokenData.refreshToken,
          tokenExpiresAt: tokenData.expiresIn ? new Date(Date.now() + tokenData.expiresIn * 1000) : undefined,
        });
        
        await this.googleAccountRepository.create(googleAccount);
      } else {
        // Criar novo usuário
        isNewUser = true;
        
        user = User.create({
          name: googleUserData.name,
          email: googleUserData.email,
          password: '', // Usuários Google não têm senha
          roles: [UserRole.USER],
        });
        
        await this.userRepository.create(user);
        
        // Criar conta Google vinculada
        const googleAccount = GoogleAccount.create({
          userId: user.getId(),
          googleId: googleUserData.id,
          googleEmail: googleUserData.email,
          picture: googleUserData.picture,
          locale: googleUserData.locale,
          googleAccessToken: tokenData.accessToken,
          googleRefreshToken: tokenData.refreshToken,
          tokenExpiresAt: tokenData.expiresIn ? new Date(Date.now() + tokenData.expiresIn * 1000) : undefined,
        });
        
        await this.googleAccountRepository.create(googleAccount);
      }
    }

    // 4. Gerar tokens JWT
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
      isNewUser,
    };
  }
}
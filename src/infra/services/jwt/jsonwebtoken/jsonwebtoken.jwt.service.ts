import * as jsonwebtoken from 'jsonwebtoken';
import { ServiceException } from '../../exceptions/service.exception';
import {
  GenerateAuthTokenWithResfreshTokenOutput,
  JwtAuthPayload,
  JwtRefreshPayload,
  JwtService,
} from '../jwt.service';
import { RefreshTokenNotValidServiceException } from '../../exceptions/jsonwebtoken/refresh-token-not-valid.service.exception';
import { Injectable } from '@nestjs/common';
import { AuthTokenNotValidServiceException } from '../../exceptions/jsonwebtoken/auth-token-not-valid.service.exception';
import { UserRole } from 'generated/prisma';

@Injectable()
export class JasonWebTokenService extends JwtService {
  private authSecret: string;
  private refreshSecret: string;

  public constructor() {
    super();

    if (!process.env.JWT_AUTH_SECRET || !process.env.JWT_REFRESH_SECRET) {
      throw new ServiceException(
        `JWT_AUTH_SECRET or JWT_REFRESH_SECRET not set in environment variables while initializing ${JasonWebTokenService.name}`,
        `Houve um erro interno, tente novamente mais tarde`,
        JasonWebTokenService.name,
      );
    }

    this.authSecret = process.env.JWT_AUTH_SECRET;
    this.refreshSecret = process.env.JWT_REFRESH_SECRET;
  }

  public generateAuthToken(userId: string, roles: UserRole[]): string {
    const payload = this.generateAuthTokenPayload(userId, roles);

    const token = jsonwebtoken.sign(payload, this.authSecret, {
      expiresIn: '1h',
    });

    return token;
  }

  private generateAuthTokenPayload(userId: string, roles: UserRole[]): JwtAuthPayload {
    const payload: JwtAuthPayload = {
      userId,
      roles
    };

    return payload;
  }

  public generateRefreshToken(userId: string, roles: UserRole[]): string {
    const payload = this.generateRefreshTokenPayload(userId, roles);

    const token = jsonwebtoken.sign(payload, this.refreshSecret, {
      expiresIn: '7d',
    });

    return token;
  }

  private generateRefreshTokenPayload(userId: string, roles: UserRole[]): JwtRefreshPayload {
    const payload: JwtRefreshPayload = {
      userId,
      roles
    };

    return payload;
  }

  public generateAuthTokenWithRefreshToken(
    refreshToken: string,
  ): GenerateAuthTokenWithResfreshTokenOutput {
    try {
      const payload = jsonwebtoken.verify(
        refreshToken,
        this.refreshSecret,
      ) as JwtRefreshPayload;

      const userId = payload.userId;
      const roles = payload.roles || []; // roles might not be present in refresh token

      const authToken = this.generateAuthToken(userId, roles);

      const output: GenerateAuthTokenWithResfreshTokenOutput = {
        authToken,
        userId,
        roles
      };

      return output;
    } catch (error) {
      if (error instanceof jsonwebtoken.TokenExpiredError) {
        throw new RefreshTokenNotValidServiceException(
          `Refresh token ${refreshToken} expired while refreshing auth token in ${JasonWebTokenService.name}`,
          `Credenciais inválidas. Faça o login novamente`,
          JasonWebTokenService.name,
        );
      }

      throw new RefreshTokenNotValidServiceException(
        `Refresh token ${refreshToken} not valid while refreshing auth token in ${JasonWebTokenService.name}`,
        `Credenciais inválidas. Faça o login novamente`,
        JasonWebTokenService.name,
      );
    }
  }

  public verifyAuthToken(token: string): JwtAuthPayload {
    try {
      const payload = jsonwebtoken.verify(
        token,
        this.authSecret,
      ) as JwtAuthPayload;

      return payload;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new AuthTokenNotValidServiceException(
        `Auth token ${token} not valid while verifying in ${JasonWebTokenService.name}`,
        `Credenciais inválidas. Faça o login novamente`,
        JasonWebTokenService.name,
      );
    }
  }
}
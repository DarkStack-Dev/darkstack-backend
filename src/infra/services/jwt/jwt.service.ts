import { User, UserRole } from "generated/prisma";

export type GenerateAuthTokenWithResfreshTokenOutput = {
  authToken: string;
  userId: string;
  roles: UserRole[];
};

export type JwtAuthPayload = {
  userId: string;
  roles: UserRole[];
};

export type JwtRefreshPayload = {
  userId: string;
  roles: UserRole[];
};

export abstract class JwtService{
  public abstract generateAuthToken(userId: string, roles: UserRole[]): string;
  public abstract generateRefreshToken(userId: string, roles: UserRole[]): string;
  public abstract generateAuthTokenWithRefreshToken(
    refreshToken: string,
  ): GenerateAuthTokenWithResfreshTokenOutput;
  public abstract verifyAuthToken(token: string): JwtAuthPayload;
}
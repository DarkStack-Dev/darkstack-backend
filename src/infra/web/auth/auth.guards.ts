import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtService } from 'src/infra/services/jwt/jwt.service';
import { IS_PUBLIC } from './decorators/is-public.decorator';
import { User, UserRole } from 'generated/prisma';
import { ROLES_KEY } from './decorators/roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  public constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  public canActivate(context: ExecutionContext): boolean {
  const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
    context.getHandler(),
    context.getClass(),
  ]);

  if (isPublic) {
    return true;
  }

  const request = context.switchToHttp().getRequest<Request>();
  const token = this.extractTokenFromRequest(request);

  if (!token) {
    throw new UnauthorizedException('Access token is required');
  }

  let payload;
  try {
    payload = this.jwtService.verifyAuthToken(token);
  } catch (error) {
    throw new UnauthorizedException('Invalid or expired token');
  }

  if (!payload || !payload.userId) {
    throw new UnauthorizedException('Invalid token payload');
  }

  // Verificar se usuário está ativo (se aplicável)
  if (payload.isActive === false) {
    throw new UnauthorizedException('Account is suspended');
  }

  request['userId'] = payload.userId;
  request['user'] = payload;

  const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
    ROLES_KEY,
    [context.getHandler(), context.getClass()],
  );

  if (!requiredRoles || requiredRoles.length === 0) {
    return true; // Usuário autenticado, sem roles específicas necessárias
  }

  const userRoles = payload.roles || [];
  
  if (userRoles.length === 0) {
    throw new UnauthorizedException('User has no assigned roles');
  }

  const hasRequiredRole = userRoles.some((role) => requiredRoles.includes(role));
  console.log(hasRequiredRole, requiredRoles, userRoles);
  if (!hasRequiredRole) {
    throw new UnauthorizedException(
      `Access denied. Required roles: ${requiredRoles.join(', ')}`
    );
  }

  return true;
}

  // authorization: Bearer <token>

  // ✅ Corrigido typo no nome do método
  private extractTokenFromRequest(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

export const AuthGuardProvider = {
  provide: APP_GUARD,
  useClass: AuthGuard,
};
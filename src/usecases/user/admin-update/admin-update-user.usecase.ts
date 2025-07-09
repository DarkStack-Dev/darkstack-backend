// src/usecases/user/admin-update/admin-update-user.usecase.ts

import { Injectable } from '@nestjs/common';
import { UserRole } from 'generated/prisma';
import { AdminUpdateUserUseCase as DomainAdminUpdateUserUseCase } from '@/domain/usecases/user/admin-update/admin-update-user.usecase';
import { UserNotFoundUsecaseException } from '@/usecases/exceptions/user/user-not-found.usecase.exception';
import { EmailAlreadyExistsUsecaseException } from '@/usecases/exceptions/email-already-exists.usecase.exception';
import { Usecase } from '@/usecases/usecase';

export type AdminUpdateUserInput = {
  targetUserId: string;
  adminId: string;
  adminRoles: UserRole[];
  name?: string;
  email?: string;
  avatar?: string;
  roles?: UserRole[];
  isActive?: boolean;
  emailVerified?: boolean;
  newPassword?: string;
  forcePasswordChange?: boolean;
};

export type AdminUpdateUserOutput = {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    roles: UserRole[];
    isActive: boolean;
    emailVerified: boolean;
    updatedAt: Date;
  };
  changedFields: string[];
  admin: {
    id: string;
    name: string;
    email: string;
  };
};

@Injectable()
export class AdminUpdateUserUsecase implements Usecase<AdminUpdateUserInput, AdminUpdateUserOutput> {
  public constructor(
    private readonly domainAdminUpdateUserUseCase: DomainAdminUpdateUserUseCase,
  ) {}

  public async execute(input: AdminUpdateUserInput): Promise<AdminUpdateUserOutput> {
    try {
      const result = await this.domainAdminUpdateUserUseCase.execute(input);

      return {
        success: result.success,
        message: result.message,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          avatar: result.user.avatar,
          roles: result.user.roles,
          isActive: result.user.isActive,
          emailVerified: result.user.emailVerified,
          updatedAt: result.user.updatedAt,
        },
        changedFields: result.changedFields,
        admin: {
          id: result.admin.id,
          name: result.admin.name,
          email: result.admin.email,
        },
      };
    } catch (error) {
      // Mapear exceptions do domínio para exceptions da aplicação
      if (error.name === 'UserNotFoundUsecaseException') {
        throw new UserNotFoundUsecaseException(
          error.internalMessage || `User not found in ${AdminUpdateUserUsecase.name}`,
          error.externalMessage || 'Usuário não encontrado.',
          AdminUpdateUserUsecase.name,
        );
      }

      if (error.name === 'EmailAlreadyExistsUsecaseException') {
        throw new EmailAlreadyExistsUsecaseException(
          error.internalMessage || `Email already exists in ${AdminUpdateUserUsecase.name}`,
          error.externalMessage || 'E-mail já está sendo usado.',
          AdminUpdateUserUsecase.name,
        );
      }

      throw error;
    }
  }
}

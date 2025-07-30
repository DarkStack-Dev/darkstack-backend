// src/usecases/user/moderator-update/moderator-update-user.usecase.ts

import { Injectable } from '@nestjs/common';
import { UserRole } from 'generated/prisma';
import { ModeratorUpdateUserUseCase as DomainModeratorUpdateUserUseCase } from '@/domain/usecases/user/moderator-update/moderator-update-user.usecase';
import { UserNotFoundUsecaseException } from '@/usecases/exceptions/user/user-not-found.usecase.exception';
import { Usecase } from '@/usecases/usecase';

export type ModeratorUpdateUserInput = {
  targetUserId: string;
  moderatorId: string;
  moderatorRoles: UserRole[];
  isActive?: boolean;
  emailVerified?: boolean;
  reason?: string;
};

export type ModeratorUpdateUserOutput = {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    emailVerified: boolean;
    updatedAt: Date;
  };
  changedFields: string[];
  moderator: {
    id: string;
    name: string;
    email: string;
  };
  reason?: string;
};

@Injectable()
export class ModeratorUpdateUserUsecase implements Usecase<ModeratorUpdateUserInput, ModeratorUpdateUserOutput> {
  public constructor(
    private readonly domainModeratorUpdateUserUseCase: DomainModeratorUpdateUserUseCase,
  ) {}

  public async execute(input: ModeratorUpdateUserInput): Promise<ModeratorUpdateUserOutput> {
    try {
      const result = await this.domainModeratorUpdateUserUseCase.execute(input);

      return {
        success: result.success,
        message: result.message,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          isActive: result.user.isActive,
          emailVerified: result.user.emailVerified,
          updatedAt: result.user.updatedAt,
        },
        changedFields: result.changedFields,
        moderator: {
          id: result.moderator.id,
          name: result.moderator.name,
          email: result.moderator.email,
        },
        reason: result.reason,
      };
    } catch (error) {
      // Mapear exceptions do domínio para exceptions da aplicação
      if (error.name === 'UserNotFoundUsecaseException') {
        throw new UserNotFoundUsecaseException(
          error.internalMessage || `User not found in ${ModeratorUpdateUserUsecase.name}`,
          error.externalMessage || 'Usuário não encontrado.',
          ModeratorUpdateUserUsecase.name,
        );
      }

      throw error;
    }
  }
}

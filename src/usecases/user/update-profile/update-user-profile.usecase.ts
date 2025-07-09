// src/usecases/user/update-profile/update-user-profile.usecase.ts

import { Injectable } from '@nestjs/common';
import { UpdateUserProfileUseCase as DomainUpdateUserProfileUseCase } from '@/domain/usecases/user/update-profile/update-user-profile.usecase';
import { UserNotFoundUsecaseException } from '@/usecases/exceptions/user/user-not-found.usecase.exception';
import { EmailAlreadyExistsUsecaseException } from '@/usecases/exceptions/email-already-exists.usecase.exception';
import { Usecase } from '@/usecases/usecase';

export type UpdateUserProfileInput = {
  userId: string;
  name?: string;
  email?: string;
  avatar?: string;
  currentPassword?: string;
  newPassword?: string;
};

export type UpdateUserProfileOutput = {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    updatedAt: Date;
  };
  changedFields: string[];
};

@Injectable()
export class UpdateUserProfileUsecase implements Usecase<UpdateUserProfileInput, UpdateUserProfileOutput> {
  public constructor(
    private readonly domainUpdateUserProfileUseCase: DomainUpdateUserProfileUseCase,
  ) {}

  public async execute(input: UpdateUserProfileInput): Promise<UpdateUserProfileOutput> {
    try {
      const result = await this.domainUpdateUserProfileUseCase.execute(input);

      return {
        success: result.success,
        message: result.message,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          avatar: result.user.avatar,
          updatedAt: result.user.updatedAt,
        },
        changedFields: result.changedFields,
      };
    } catch (error) {
      // Mapear exceptions do domínio para exceptions da aplicação
      if (error.name === 'UserNotFoundUsecaseException') {
        throw new UserNotFoundUsecaseException(
          error.internalMessage || `User not found with id ${input.userId} in ${UpdateUserProfileUsecase.name}`,
          error.externalMessage || 'Usuário não encontrado.',
          UpdateUserProfileUsecase.name,
        );
      }

      if (error.name === 'EmailAlreadyExistsUsecaseException') {
        throw new EmailAlreadyExistsUsecaseException(
          error.internalMessage || `Email ${input.email} already exists in ${UpdateUserProfileUsecase.name}`,
          error.externalMessage || 'E-mail já está sendo usado.',
          UpdateUserProfileUsecase.name,
        );
      }

      throw error;
    }
  }
}

// src/usecases/article/get-pending-moderation/get-pending-moderation.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { GetPendingModerationUseCase as DomainGetPendingModerationUseCase } from '@/domain/usecases/article/get-pending-moderation/get-pending-moderation.usecase';
import { UserNotFoundUsecaseException } from '@/usecases/exceptions/user/user-not-found.usecase.exception';
import { InvalidInputUsecaseException } from '@/usecases/exceptions/input/invalid-input.usecase.exception';
import { UserRole } from 'generated/prisma';

export type GetPendingModerationInput = {
  moderatorId: string;
  moderatorRoles: UserRole[];
  includeOwn?: boolean;
};

export type GetPendingModerationOutput = {
  articles: Array<{
    id: string;
    titulo: string;
    slug: string;
    descricao: string;
    categoria: string;
    tags: string[];
    createdAt: Date;
    tempoLeituraMinutos?: number;
    author: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    mainImage?: {
      url: string;
      alt?: string;
    };
  }>;
  total: number;
  moderator: {
    id: string;
    name: string;
    email: string;
  };
};

@Injectable()
export class GetPendingModerationUsecase implements Usecase<GetPendingModerationInput, GetPendingModerationOutput> {
  constructor(
    private readonly domainGetPendingModerationUseCase: DomainGetPendingModerationUseCase,
  ) {}

  async execute(input: GetPendingModerationInput): Promise<GetPendingModerationOutput> {
    try {
      return await this.domainGetPendingModerationUseCase.execute(input);
    } catch (error) {
      // Mapear exceptions do domínio para aplicação
      if (error.name === 'UserNotFoundUsecaseException') {
        throw new UserNotFoundUsecaseException(
          error.internalMessage || `Moderator not found in ${GetPendingModerationUsecase.name}`,
          error.externalMessage || 'Moderador não encontrado',
          GetPendingModerationUsecase.name,
        );
      }

      if (error.name === 'InvalidInputUsecaseException') {
        throw new InvalidInputUsecaseException(
          error.internalMessage || `Invalid input in ${GetPendingModerationUsecase.name}`,
          error.externalMessage || 'Dados inválidos',
          GetPendingModerationUsecase.name,
        );
      }

      throw error;
    }
  }
}
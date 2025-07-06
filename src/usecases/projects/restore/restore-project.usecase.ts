// src/usecases/projects/restore/restore-project.usecase.ts

import { Injectable } from '@nestjs/common';
import { UserRole } from 'generated/prisma';
import { RestoreProjectUseCase as DomainRestoreProjectUseCase } from '@/domain/usecases/projects/restore/restore-project.usecase';
import { ProjectNotFoundUsecaseException } from '@/usecases/exceptions/projects/project-not-found.usecase.exception';
import { ProjectAccessDeniedUsecaseException } from '@/usecases/exceptions/projects/project-access-denied.usecase.exception';
import { UserNotFoundUsecaseException } from '@/usecases/exceptions/user/user-not-found.usecase.exception';
import { Usecase } from '@/usecases/usecase';

export type RestoreProjectInput = {
  projectId: string;
  userId: string;
  userRoles: UserRole[];
};

export type RestoreProjectOutput = {
  success: boolean;
  message: string;
  restoredAt: Date;
  project: {
    id: string;
    name: string;
    ownerId: string;
  };
};

@Injectable()
export class RestoreProjectUsecase implements Usecase<RestoreProjectInput, RestoreProjectOutput> {
  public constructor(
    private readonly domainRestoreProjectUseCase: DomainRestoreProjectUseCase,
  ) {}

  public async execute(input: RestoreProjectInput): Promise<RestoreProjectOutput> {
    try {
      const result = await this.domainRestoreProjectUseCase.execute(input);

      return {
        success: result.success,
        message: result.message,
        restoredAt: result.restoredAt,
        project: {
          id: result.project.id,
          name: result.project.name,
          ownerId: result.project.ownerId,
        },
      };
    } catch (error) {
      // Mapear exceptions do domínio para exceptions da aplicação
      if (error.name === 'UserNotFoundUsecaseException') {
        if (error.internalMessage?.includes('Project not found')) {
          throw new ProjectNotFoundUsecaseException(
            error.internalMessage || `Project not found with id ${input.projectId} in ${RestoreProjectUsecase.name}`,
            error.externalMessage || 'Projeto não encontrado.',
            RestoreProjectUsecase.name,
          );
        } else {
          throw new UserNotFoundUsecaseException(
            error.internalMessage || `User not found with id ${input.userId} in ${RestoreProjectUsecase.name}`,
            error.externalMessage || 'Usuário não encontrado.',
            RestoreProjectUsecase.name,
          );
        }
      }

      if (error.name === 'InvalidInputUsecaseException') {
        throw new ProjectAccessDeniedUsecaseException(
          error.internalMessage || `Access denied for user ${input.userId} to restore project ${input.projectId}`,
          error.externalMessage || 'Você não tem permissão para restaurar este projeto.',
          RestoreProjectUsecase.name,
        );
      }

      throw error;
    }
  }
}
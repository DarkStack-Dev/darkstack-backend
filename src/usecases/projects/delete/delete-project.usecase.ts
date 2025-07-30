// src/usecases/projects/delete/delete-project.usecase.ts

import { Injectable } from '@nestjs/common';
import { UserRole } from 'generated/prisma';
import { DeleteProjectUseCase as DomainDeleteProjectUseCase } from '@/domain/usecases/projects/delete/delete-project.usecase';
import { ProjectNotFoundUsecaseException } from '@/usecases/exceptions/projects/project-not-found.usecase.exception';
import { ProjectAccessDeniedUsecaseException } from '@/usecases/exceptions/projects/project-access-denied.usecase.exception';
import { UserNotFoundUsecaseException } from '@/usecases/exceptions/user/user-not-found.usecase.exception';
import { Usecase } from '@/usecases/usecase';

export type DeleteProjectInput = {
  projectId: string;
  userId: string;
  userRoles: UserRole[];
  isPermanent?: boolean;
};

export type DeleteProjectOutput = {
  success: boolean;
  message: string;
  deletedAt: Date;
  isPermanent: boolean;
  project: {
    id: string;
    name: string;
    ownerId: string;
  };
};

@Injectable()
export class DeleteProjectUsecase implements Usecase<DeleteProjectInput, DeleteProjectOutput> {
  public constructor(
    private readonly domainDeleteProjectUseCase: DomainDeleteProjectUseCase,
  ) {}

  public async execute(input: DeleteProjectInput): Promise<DeleteProjectOutput> {
    try {
      const result = await this.domainDeleteProjectUseCase.execute(input);

      return {
        success: result.success,
        message: result.message,
        deletedAt: result.deletedAt,
        isPermanent: result.isPermanent,
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
            error.internalMessage || `Project not found with id ${input.projectId} in ${DeleteProjectUsecase.name}`,
            error.externalMessage || 'Projeto não encontrado.',
            DeleteProjectUsecase.name,
          );
        } else {
          throw new UserNotFoundUsecaseException(
            error.internalMessage || `User not found with id ${input.userId} in ${DeleteProjectUsecase.name}`,
            error.externalMessage || 'Usuário não encontrado.',
            DeleteProjectUsecase.name,
          );
        }
      }

      if (error.name === 'InvalidInputUsecaseException') {
        throw new ProjectAccessDeniedUsecaseException(
          error.internalMessage || `Access denied for user ${input.userId} to delete project ${input.projectId}`,
          error.externalMessage || 'Você não tem permissão para deletar este projeto.',
          DeleteProjectUsecase.name,
        );
      }

      throw error;
    }
  }
}

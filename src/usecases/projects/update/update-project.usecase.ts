// src/usecases/projects/update/update-project.usecase.ts

import { Injectable } from '@nestjs/common';
import { ImageType, ProjectStatus } from 'generated/prisma';
import { UpdateProjectUseCase as DomainUpdateProjectUseCase } from '@/domain/usecases/projects/update/update-project.usecase';
import { ProjectNotFoundUsecaseException } from '@/usecases/exceptions/projects/project-not-found.usecase.exception';
import { ProjectAccessDeniedUsecaseException } from '@/usecases/exceptions/projects/project-access-denied.usecase.exception';
import { UserNotFoundUsecaseException } from '@/usecases/exceptions/user/user-not-found.usecase.exception';
import { Usecase } from '@/usecases/usecase';

export type ProjectImageUpdateInput = {
  id?: string;
  filename: string;
  type: ImageType;
  size?: number;
  width?: number;
  height?: number;
  base64?: string;
  url?: string;
  metadata?: any;
  isMain?: boolean;
  order?: number;
  shouldDelete?: boolean;
};

export type UpdateProjectInput = {
  projectId: string;
  userId: string;
  name?: string;
  description?: string;
  images?: ProjectImageUpdateInput[];
  shouldResetStatus?: boolean;
};

export type UpdateProjectOutput = {
  success: boolean;
  message: string;
  project: {
    id: string;
    name: string;
    description: string;
    status: ProjectStatus;
    updatedAt: Date;
  };
  images: {
    id: string;
    filename: string;
    url: string;
    isMain: boolean;
    order: number;
  }[];
  statusChanged: boolean;
};

@Injectable()
export class UpdateProjectUsecase implements Usecase<UpdateProjectInput, UpdateProjectOutput> {
  public constructor(
    private readonly domainUpdateProjectUseCase: DomainUpdateProjectUseCase,
  ) {}

  public async execute(input: UpdateProjectInput): Promise<UpdateProjectOutput> {
    try {
      const result = await this.domainUpdateProjectUseCase.execute(input);

      return {
        success: result.success,
        message: result.message,
        project: {
          id: result.project.id,
          name: result.project.name,
          description: result.project.description,
          status: result.project.status,
          updatedAt: result.project.updatedAt,
        },
        images: result.images.map(img => ({
          id: img.id,
          filename: img.filename,
          url: img.url,
          isMain: img.isMain,
          order: img.order,
        })),
        statusChanged: result.statusChanged,
      };
    } catch (error) {
      // Mapear exceptions do domínio para exceptions da aplicação
      if (error.name === 'UserNotFoundUsecaseException') {
        if (error.internalMessage?.includes('Project not found')) {
          throw new ProjectNotFoundUsecaseException(
            error.internalMessage || `Project not found with id ${input.projectId} in ${UpdateProjectUsecase.name}`,
            error.externalMessage || 'Projeto não encontrado.',
            UpdateProjectUsecase.name,
          );
        } else {
          throw new UserNotFoundUsecaseException(
            error.internalMessage || `User not found with id ${input.userId} in ${UpdateProjectUsecase.name}`,
            error.externalMessage || 'Usuário não encontrado.',
            UpdateProjectUsecase.name,
          );
        }
      }

      if (error.name === 'InvalidInputUsecaseException') {
        throw new ProjectAccessDeniedUsecaseException(
          error.internalMessage || `Access denied for user ${input.userId} to update project ${input.projectId}`,
          error.externalMessage || 'Você não tem permissão para atualizar este projeto.',
          UpdateProjectUsecase.name,
        );
      }

      throw error;
    }
  }
}
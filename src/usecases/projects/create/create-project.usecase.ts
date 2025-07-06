// src/usecases/projects/create/create-project.usecase.ts

import { Injectable } from '@nestjs/common';
import { ImageType, ProjectStatus } from 'generated/prisma';
import { CreateProjectsUseCase as DomainCreateProjectsUseCase } from '@/domain/usecases/projects/create/create-projects.usecase';
import { UserNotFoundUsecaseException } from '@/usecases/exceptions/user/user-not-found.usecase.exception';
import { ProjectLimitReachedUsecaseException } from '@/usecases/exceptions/projects/project-limit-reached.usecase.exception';
import { Usecase } from '@/usecases/usecase';

export type CreateProjectInput = {
  name: string;
  description: string;
  images: {
    filename: string;
    type: ImageType;
    size?: number;
    width?: number;
    height?: number;
    base64?: string;
    url?: string;
    metadata?: any;
    isMain?: boolean;
  }[];
  userId: string;
};

export type CreateProjectOutput = {
  id: string;
  name: string;
  status: ProjectStatus;
  createdAt: Date;
};

@Injectable()
export class CreateProjectUsecase implements Usecase<CreateProjectInput, CreateProjectOutput> {
  public constructor(
    private readonly domainCreateProjectsUseCase: DomainCreateProjectsUseCase,
  ) {}

  public async execute({
    name,
    description,
    images,
    userId,
  }: CreateProjectInput): Promise<CreateProjectOutput> {
    try {
      const result = await this.domainCreateProjectsUseCase.execute({
        name,
        description,
        images,
        userId,
      });

      return {
        id: result.id,
        name: result.name,
        status: result.status,
        createdAt: result.createdAt,
      };
    } catch (error) {
      // Mapear exceptions do domínio para exceptions da aplicação
      if (error.name === 'UserNotFoundUsecaseException') {
        throw new UserNotFoundUsecaseException(
          error.internalMessage || `User not found with id ${userId} in ${CreateProjectUsecase.name}`,
          error.externalMessage || 'Usuário não encontrado.',
          CreateProjectUsecase.name,
        );
      }

      if (error.name === 'ProjectsAumontLimitReachedUsecaseException') {
        throw new ProjectLimitReachedUsecaseException(
          error.internalMessage || `Project limit reached for user ${userId} in ${CreateProjectUsecase.name}`,
          error.externalMessage || 'Limite de projetos atingido.',
          CreateProjectUsecase.name,
        );
      }

      // Re-lançar outros erros
      throw error;
    }
  }
}
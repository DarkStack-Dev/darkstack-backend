// src/usecases/projects/list-deleted/list-deleted-projects.usecase.ts

import { Injectable } from '@nestjs/common';
import { UserRole } from 'generated/prisma';
import { ListDeletedProjectsUseCase as DomainListDeletedProjectsUseCase } from '@/domain/usecases/projects/list-deleted/list-deleted-projects.usecase';
import { ProjectAccessDeniedUsecaseException } from '@/usecases/exceptions/projects/project-access-denied.usecase.exception';
import { Usecase } from '@/usecases/usecase';

export type ListDeletedProjectsInput = {
  userId: string;
  userRoles: UserRole[];
  page?: number;
  limit?: number;
};

export type DeletedProjectSummaryOutput = {
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  imageCount: number;
  participantCount: number;
  daysSinceDeleted: number;
};

export type ListDeletedProjectsOutput = {
  projects: DeletedProjectSummaryOutput[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
};

@Injectable()
export class ListDeletedProjectsUsecase implements Usecase<ListDeletedProjectsInput, ListDeletedProjectsOutput> {
  public constructor(
    private readonly domainListDeletedProjectsUseCase: DomainListDeletedProjectsUseCase,
  ) {}

  public async execute(input: ListDeletedProjectsInput): Promise<ListDeletedProjectsOutput> {
    try {
      const result = await this.domainListDeletedProjectsUseCase.execute(input);

      return {
        projects: result.projects.map(project => ({
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          deletedAt: project.deletedAt,
          owner: {
            id: project.owner.id,
            name: project.owner.name,
            email: project.owner.email,
          },
          imageCount: project.imageCount,
          participantCount: project.participantCount,
          daysSinceDeleted: project.daysSinceDeleted,
        })),
        pagination: result.pagination,
      };
    } catch (error) {
      if (error.name === 'InvalidInputUsecaseException') {
        throw new ProjectAccessDeniedUsecaseException(
          error.internalMessage || `Access denied for user ${input.userId} to list deleted projects`,
          error.externalMessage || 'Você não tem permissão para listar projetos deletados.',
          ListDeletedProjectsUsecase.name,
        );
      }

      throw error;
    }
  }
}
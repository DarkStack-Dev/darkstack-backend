// 📁 src/usecases/projects/list/list-projects.usecase.ts
import { Injectable } from '@nestjs/common';
import { ProjectStatus } from 'generated/prisma';
import { ListProjectsUseCase as DomainListProjectsUseCase } from '@/domain/usecases/projects/list/list-projects.usecase';
import { Usecase } from '@/usecases/usecase';

export type ListProjectsInput = {
  page?: number;
  limit?: number;
  status?: ProjectStatus;
  search?: string;
  ownerId?: string;
  currentUserId?: string;
};

export type ProjectSummaryOutput = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  mainImage?: {
    url: string;
    filename: string;
  };
  participantCount: number;
  imageCount: number;
};

export type ListProjectsOutput = {
  projects: ProjectSummaryOutput[];
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
export class ListProjectsUsecase implements Usecase<ListProjectsInput, ListProjectsOutput> {
  public constructor(
    private readonly domainListProjectsUseCase: DomainListProjectsUseCase,
  ) {}

  public async execute(input: ListProjectsInput): Promise<ListProjectsOutput> {
    const result = await this.domainListProjectsUseCase.execute(input);

    return {
      projects: result.projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        owner: {
          id: project.owner.id,
          name: project.owner.name,
          avatar: project.owner.avatar,
        },
        mainImage: project.mainImage,
        participantCount: project.participantCount,
        imageCount: project.imageCount,
      })),
      pagination: result.pagination,
    };
  }
}
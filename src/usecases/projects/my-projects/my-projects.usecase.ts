// 📁 src/usecases/projects/my-projects/my-projects.usecase.ts
import { Injectable } from '@nestjs/common';
import { ProjectStatus } from 'generated/prisma';
import { MyProjectsUseCase as DomainMyProjectsUseCase } from '@/domain/usecases/projects/my-projects/my-projects.usecase';
import { UserNotFoundUsecaseException } from '@/usecases/exceptions/user/user-not-found.usecase.exception';
import { Usecase } from '@/usecases/usecase';

export type MyProjectsInput = {
  userId: string;
  page?: number;
  limit?: number;
  status?: ProjectStatus;
  includeDeleted?: boolean;
};

export type MyProjectSummaryOutput = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  mainImage?: {
    url: string;
    filename: string;
  };
  participantCount: number;
  imageCount: number;
  approvedAt?: Date;
  rejectionReason?: string;
  isActive: boolean;
};

export type MyProjectsOutput = {
  projects: MyProjectSummaryOutput[];
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    archived: number;
  };
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
export class MyProjectsUsecase implements Usecase<MyProjectsInput, MyProjectsOutput> {
  public constructor(
    private readonly domainMyProjectsUseCase: DomainMyProjectsUseCase,
  ) {}

  public async execute(input: MyProjectsInput): Promise<MyProjectsOutput> {
    try {
      const result = await this.domainMyProjectsUseCase.execute(input);

      return {
        projects: result.projects.map(project => ({
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          deletedAt: project.deletedAt,
          mainImage: project.mainImage,
          participantCount: project.participantCount,
          imageCount: project.imageCount,
          approvedAt: project.approvedAt,
          rejectionReason: project.rejectionReason,
          isActive: project.isActive,
        })),
        stats: result.stats,
        pagination: result.pagination,
      };
    } catch (error) {
      if (error.name === 'UserNotFoundUsecaseException') {
        throw new UserNotFoundUsecaseException(
          error.internalMessage || `User not found with id ${input.userId} in ${MyProjectsUsecase.name}`,
          error.externalMessage || 'Usuário não encontrado.',
          MyProjectsUsecase.name,
        );
      }

      throw error;
    }
  }
}
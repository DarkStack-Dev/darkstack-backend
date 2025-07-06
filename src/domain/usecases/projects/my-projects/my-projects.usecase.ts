// src/domain/usecases/projects/my-projects/my-projects.usecase.ts

import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { ProjectsGatewayRepository } from '@/domain/repositories/projects/projects.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { UserNotFoundUsecaseException } from '../../exceptions/user/user-not-found.usecase.exception';
import { ProjectStatus } from 'generated/prisma';

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
  // Informações de moderação (apenas para o dono)
  approvedAt?: Date;
  rejectionReason?: string;
  isActive: boolean;
};

export type ProjectStatsOutput = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  archived: number;
};

export type MyProjectsOutput = {
  projects: MyProjectSummaryOutput[];
  stats: ProjectStatsOutput;
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
export class MyProjectsUseCase implements UseCase<MyProjectsInput, MyProjectsOutput> {
  constructor(
    private readonly projectsRepository: ProjectsGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
  ) {}

  public async execute({
    userId,
    page = 1,
    limit = 10,
    status,
    includeDeleted = false,
  }: MyProjectsInput): Promise<MyProjectsOutput> {
    console.log(`📋 Listando meus projetos para userId: ${userId}`);

    // Verificar se usuário existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundUsecaseException(
        `User not found with id ${userId} in ${MyProjectsUseCase.name}`,
        'Usuário não encontrado',
        MyProjectsUseCase.name,
      );
    }

    const safeLimit = Math.min(limit, 50);
    const offset = (page - 1) * safeLimit;

    try {
      // Filtros para buscar projetos
      const filters: any = {
        ownerId: userId,
        limit: safeLimit,
        offset,
      };

      if (status) {
        filters.status = status;
      }

      // Buscar projetos
      const { projects, total } = includeDeleted 
        ? await this.projectsRepository.findWithFilters(filters) // TODO: Implementar busca incluindo deletados
        : await this.projectsRepository.findWithFilters(filters);

      // Processar projetos
      const processedProjects: MyProjectSummaryOutput[] = projects.map(project => {
        const mainImg = project.getImages().find(img => img.isMain);
        
        return {
          id: project.getId(),
          name: project.getName(),
          description: project.getDescription().length > 100 
            ? project.getDescription().substring(0, 100) + '...'
            : project.getDescription(),
          status: project.getStatus(),
          createdAt: project.getCreatedAt(),
          updatedAt: project.getUpdatedAt(),
          deletedAt: project.getDeletedAt(),
          mainImage: mainImg ? {
            url: mainImg.url || '',
            filename: mainImg.filename,
          } : undefined,
          participantCount: project.getParticipants()?.length || 0,
          imageCount: project.getImages().length,
          approvedAt: project.getApprovedAt(),
          rejectionReason: project.getRejectionReason(),
          isActive: project.getIsActivate(),
        };
      });

      // Buscar estatísticas do usuário
      const userStats: ProjectStatsOutput = {
        total: await this.projectsRepository.amountProjectsByUserId(userId),
        pending: await this.projectsRepository.amountProjectsByUserIdAndStatus(userId, ProjectStatus.PENDING),
        approved: await this.projectsRepository.amountProjectsByUserIdAndStatus(userId, ProjectStatus.APPROVED),
        rejected: await this.projectsRepository.amountProjectsByUserIdAndStatus(userId, ProjectStatus.REJECTED),
        archived: await this.projectsRepository.amountProjectsByUserIdAndStatus(userId, ProjectStatus.ARCHIVED),
      };

      const totalPages = Math.ceil(total / safeLimit);

      console.log(`✅ Encontrados ${processedProjects.length} projetos do usuário`);
      console.log(`📊 Stats: ${JSON.stringify(userStats)}`);

      return {
        projects: processedProjects,
        stats: userStats,
        pagination: {
          page,
          limit: safeLimit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
      };
    } catch (error) {
      console.error('❌ Erro ao listar meus projetos:', error);
      throw error;
    }
  }
}
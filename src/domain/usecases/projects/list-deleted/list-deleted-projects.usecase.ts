// src/domain/usecases/projects/list-deleted/list-deleted-projects.usecase.ts

import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { ProjectsGatewayRepository } from '@/domain/repositories/projects/projects.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { InvalidInputUsecaseException } from '../../exceptions/input/invalid-input.usecase.exception';
import { UserRole } from 'generated/prisma';

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
export class ListDeletedProjectsUseCase implements UseCase<ListDeletedProjectsInput, ListDeletedProjectsOutput> {
  constructor(
    private readonly projectsRepository: ProjectsGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
  ) {}

  public async execute({
    userId,
    userRoles,
    page = 1,
    limit = 20,
  }: ListDeletedProjectsInput): Promise<ListDeletedProjectsOutput> {
    console.log(`🗑️ Listando projetos deletados para admin/moderador ${userId}`);

    // 1. Verificar permissões (apenas admin/moderador)
    this.checkPermissions(userRoles);

    const safeLimit = Math.min(limit, 50);

    try {
      // 2. Buscar projetos deletados
      const deletedProjects = await this.projectsRepository.findSoftDeleted();

      // 3. Aplicar paginação manual (já que não temos filtro específico no repository)
      const offset = (page - 1) * safeLimit;
      const paginatedProjects = deletedProjects.slice(offset, offset + safeLimit);

      // 4. Buscar dados dos proprietários
      const projectsWithOwners: DeletedProjectSummaryOutput[] = [];
      
      for (const project of paginatedProjects) {
        const owner = await this.userRepository.findById(project.getOwnerId());
        
        if (owner && project.getDeletedAt()) {
          const daysSinceDeleted = Math.floor(
            (new Date().getTime() - project.getDeletedAt()!.getTime()) / (1000 * 60 * 60 * 24)
          );

          projectsWithOwners.push({
            id: project.getId(),
            name: project.getName(),
            description: project.getDescription().length > 100 
              ? project.getDescription().substring(0, 100) + '...'
              : project.getDescription(),
            status: project.getStatus(),
            createdAt: project.getCreatedAt(),
            updatedAt: project.getUpdatedAt(),
            deletedAt: project.getDeletedAt()!,
            owner: {
              id: owner.getId(),
              name: owner.getName(),
              email: owner.getEmail(),
            },
            imageCount: project.getImages().length,
            participantCount: project.getParticipants()?.length || 0,
            daysSinceDeleted,
          });
        }
      }

      const totalPages = Math.ceil(deletedProjects.length / safeLimit);

      console.log(`✅ Encontrados ${projectsWithOwners.length} de ${deletedProjects.length} projetos deletados`);

      return {
        projects: projectsWithOwners,
        pagination: {
          page,
          limit: safeLimit,
          total: deletedProjects.length,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
      };
    } catch (error) {
      console.error('❌ Erro ao listar projetos deletados:', error);
      throw error;
    }
  }

  private checkPermissions(userRoles: UserRole[]): void {
    const isAdmin = userRoles.includes(UserRole.ADMIN);
    const isModerator = userRoles.includes(UserRole.MODERATOR);

    if (!isAdmin && !isModerator) {
      throw new InvalidInputUsecaseException(
        'User attempted to list deleted projects without permission',
        'Apenas administradores e moderadores podem listar projetos deletados',
        ListDeletedProjectsUseCase.name,
      );
    }
  }
}
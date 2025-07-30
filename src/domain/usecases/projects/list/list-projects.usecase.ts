// src/domain/usecases/projects/list/list-projects.usecase.ts

import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { ProjectsGatewayRepository } from '@/domain/repositories/projects/projects.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { ProjectStatus } from 'generated/prisma';

export type ListProjectsInput = {
  page?: number;
  limit?: number;
  status?: ProjectStatus;
  search?: string;
  ownerId?: string;
  currentUserId?: string; // Para verificar permissões
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
export class ListProjectsUseCase implements UseCase<ListProjectsInput, ListProjectsOutput> {
  constructor(
    private readonly projectsRepository: ProjectsGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
  ) {}

  public async execute({
    page = 1,
    limit = 12,
    status,
    search,
    ownerId,
    currentUserId,
  }: ListProjectsInput): Promise<ListProjectsOutput> {
    // Limitar o número máximo por página
    const safeLimit = Math.min(limit, 50);
    const offset = (page - 1) * safeLimit;

    console.log(`📋 Listando projetos - Página: ${page}, Limite: ${safeLimit}`);

    // Filtros
    const filters: any = {
      limit: safeLimit,
      offset,
    };

    // Se não especificar status e não for busca por owner específico, 
    // mostrar apenas aprovados para usuários não autenticados
    if (status) {
      filters.status = status;
    } else if (!ownerId && !currentUserId) {
      filters.status = ProjectStatus.APPROVED; // Default: apenas aprovados para público
    }

    if (search) {
      filters.search = search;
    }

    if (ownerId) {
      filters.ownerId = ownerId;
    }

    try {
      const { projects, total } = await this.projectsRepository.findWithFilters(filters);

      console.log(`✅ Encontrados ${projects.length} de ${total} projetos`);

      // Buscar dados dos proprietários
      const projectsWithOwners: ProjectSummaryOutput[] = [];
      
      for (const project of projects) {
        const owner = await this.userRepository.findById(project.getOwnerId());
        
        if (owner) {
          // Encontrar a imagem principal
          const mainImg = project.getImages().find(img => img.isMain);
          
          projectsWithOwners.push({
            id: project.getId(),
            name: project.getName(),
            description: project.getDescription().length > 150 
              ? project.getDescription().substring(0, 150) + '...'
              : project.getDescription(),
            status: project.getStatus(),
            createdAt: project.getCreatedAt(),
            updatedAt: project.getUpdatedAt(),
            owner: {
              id: owner.getId(),
              name: owner.getName(),
              avatar: owner.getAvatar(),
            },
            mainImage: mainImg ? {
              url: mainImg.url || '',
              filename: mainImg.filename,
            } : undefined,
            participantCount: project.getParticipants()?.length || 0,
            imageCount: project.getImages().length,
          });
        }
      }

      const totalPages = Math.ceil(total / safeLimit);

      return {
        projects: projectsWithOwners,
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
      console.error('❌ Erro ao listar projetos:', error);
      throw error;
    }
  }
}
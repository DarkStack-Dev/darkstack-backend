import { ProjectsGatewayRepository } from "@/domain/repositories/projects/projects.gateway.repository";
import { Injectable } from "@nestjs/common";
import { prismaClient } from "../client.prisma";
import { Projects } from "@/domain/entities/projects/projects.entity";
import { ProjectsPrismaModelToProjectsEntityMapper } from "./model/projects-prisma-model-to-projects-entity.mapper";
import { ProjectsEntityToProjectsPrismaModelMapper } from "./model/projects-entity-to-projects-prisma-model.mapper";
import { ProjectStatus } from "generated/prisma";

@Injectable()
export class ProjectsPrismaRepository extends ProjectsGatewayRepository {
  public constructor() {
    super();
  }

  public async findById(id: string): Promise<Projects | null> {
    const model = await prismaClient.project.findUnique({
      where: { 
        id,
        deletedAt: null // Ignorar projetos soft deleted
      },
      include: {
        owner: true, // Incluir dados do proprietário
        approvedBy: true, // Incluir dados do moderador que aprovou
        images: {
          orderBy: { order: 'asc' } // Ordenar imagens pela ordem
        },
        participants: {
          include: {
            user: true, // Incluir dados dos participantes
            addedBy: true // Incluir quem adicionou o participante
          }
        }
      }
    });

    if (!model) {
      return null;
    }

    return ProjectsPrismaModelToProjectsEntityMapper.map(model);
  }

  public async findAll(): Promise<Projects[]> {
    const models = await prismaClient.project.findMany({
      where: {
        deletedAt: null // Ignorar projetos soft deleted
      },
      include: {
        owner: true,
        approvedBy: true,
        images: {
          orderBy: { order: 'asc' }
        },
        participants: {
          include: {
            user: true,
            addedBy: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // Mais recentes primeiro
      }
    });

    return models.map(ProjectsPrismaModelToProjectsEntityMapper.map);
  }

  public async findByStatus(status: ProjectStatus): Promise<Projects[]> {
    const models = await prismaClient.project.findMany({
      where: {
        status,
        deletedAt: null
      },
      include: {
        owner: true,
        approvedBy: true,
        images: {
          orderBy: { order: 'asc' }
        },
        participants: {
          include: {
            user: true,
            addedBy: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return models.map(ProjectsPrismaModelToProjectsEntityMapper.map);
  }

  public async findByOwnerId(ownerId: string): Promise<Projects[]> {
    const models = await prismaClient.project.findMany({
      where: {
        ownerId,
        deletedAt: null
      },
      include: {
        owner: true,
        approvedBy: true,
        images: {
          orderBy: { order: 'asc' }
        },
        participants: {
          include: {
            user: true,
            addedBy: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return models.map(ProjectsPrismaModelToProjectsEntityMapper.map);
  }

  public async create(project: Projects): Promise<void> {
    const projectData = ProjectsEntityToProjectsPrismaModelMapper.map(project);
    
    // Separar dados do projeto das imagens
    const { images, ...projectMainData } = projectData;

    await prismaClient.$transaction(async (tx) => {
      // 1. Criar o projeto primeiro (usar apenas campos escalares)
      const createdProject = await tx.project.create({
        data: {
          id: projectMainData.id,
          name: projectMainData.name,
          description: projectMainData.description,
          status: projectMainData.status,
          ownerId: projectMainData.ownerId,
          approvedById: projectMainData.approvedById, // Campo escalar direto
          approvedAt: projectMainData.approvedAt,
          rejectionReason: projectMainData.rejectionReason,
          createdAt: projectMainData.createdAt,
          updatedAt: projectMainData.updatedAt,
          deletedAt: projectMainData.deletedAt
        }
      });

      // 2. Criar as imagens associadas ao projeto
      if (images && images.length > 0) {
        const imagesData = images.map((image: any) => ({
          ...image,
          projectId: createdProject.id, // Associar ao projeto criado
          id: undefined // Deixar o Prisma gerar o ID
        }));

        await tx.projectImage.createMany({
          data: imagesData
        });
      }
    });
  }

  public async update(project: Projects): Promise<void> {
    const projectData = ProjectsEntityToProjectsPrismaModelMapper.map(project);
    const { images, ...projectMainData } = projectData;

    await prismaClient.$transaction(async (tx) => {
      // 1. Atualizar dados principais do projeto (usar apenas campos escalares)
      await tx.project.update({
        where: { id: project.getId() },
        data: {
          name: projectMainData.name,
          description: projectMainData.description,
          status: projectMainData.status,
          ownerId: projectMainData.ownerId,
          approvedById: projectMainData.approvedById, // Campo escalar direto
          approvedAt: projectMainData.approvedAt,
          rejectionReason: projectMainData.rejectionReason,
          updatedAt: new Date(),
          deletedAt: projectMainData.deletedAt
          // NÃO incluir approvedBy (relação) aqui
        }
      });

      // 2. Atualizar imagens se fornecidas
      if (images && images.length > 0) {
        // Remover imagens antigas
        await tx.projectImage.deleteMany({
          where: { projectId: project.getId() }
        });

        // Criar novas imagens
        const imagesData = images.map((image: any) => ({
          ...image,
          projectId: project.getId(),
          id: undefined
        }));

        await tx.projectImage.createMany({
          data: imagesData
        });
      }
    });
  }

  public async softDelete(id: string): Promise<void> {
    await prismaClient.project.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  public async hardDelete(id: string): Promise<void> {
    await prismaClient.$transaction(async (tx) => {
      // 1. Deletar imagens primeiro (cascade deveria fazer isso, mas por garantia)
      await tx.projectImage.deleteMany({
        where: { projectId: id }
      });

      // 2. Deletar participantes
      await tx.projectParticipant.deleteMany({
        where: { projectId: id }
      });

      // 3. Deletar o projeto
      await tx.project.delete({
        where: { id }
      });
    });
  }

  public async restore(id: string): Promise<void> {
    await prismaClient.project.update({
      where: { id },
      data: {
        deletedAt: null,
        updatedAt: new Date()
      }
    });
  }

  public async amountProjectsByUserId(ownerId: string): Promise<number> {
    const count = await prismaClient.project.count({
      where: {
        ownerId,
        deletedAt: null // Não contar projetos deletados
      }
    });
    return count;
  }

  public async amountProjectsByUserIdAndStatus(ownerId: string, status: ProjectStatus): Promise<number> {
    const count = await prismaClient.project.count({
      where: {
        ownerId,
        status,
        deletedAt: null
      }
    });
    return count;
  }

  public async findPendingProjects(): Promise<Projects[]> {
    return this.findByStatus(ProjectStatus.PENDING);
  }

  public async approveProject(projectId: string, approvedById: string, approvedAt: Date = new Date()): Promise<void> {
    await prismaClient.project.update({
      where: { id: projectId },
      data: {
        status: ProjectStatus.APPROVED,
        approvedById,
        approvedAt,
        rejectionReason: null, // Limpar motivo de rejeição se houver
        updatedAt: new Date()
      }
    });
  }

  public async rejectProject(projectId: string, rejectionReason: string): Promise<void> {
    await prismaClient.project.update({
      where: { id: projectId },
      data: {
        status: ProjectStatus.REJECTED,
        rejectionReason,
        approvedById: null, // Limpar aprovação anterior se houver
        approvedAt: null,
        updatedAt: new Date()
      }
    });
  }

  public async archiveProject(projectId: string): Promise<void> {
    await prismaClient.project.update({
      where: { id: projectId },
      data: {
        status: ProjectStatus.ARCHIVED,
        updatedAt: new Date()
      }
    });
  }

  public async findByIdIncludingDeleted(id: string): Promise<Projects | null> {
    const model = await prismaClient.project.findUnique({
      where: { id },
      include: {
        owner: true,
        approvedBy: true,
        images: {
          orderBy: { order: 'asc' }
        },
        participants: {
          include: {
            user: true,
            addedBy: true
          }
        }
      }
    });

    if (!model) {
      return null;
    }

    return ProjectsPrismaModelToProjectsEntityMapper.map(model);
  }

  public async findSoftDeleted(): Promise<Projects[]> {
    const models = await prismaClient.project.findMany({
      where: {
        deletedAt: {
          not: null
        }
      },
      include: {
        owner: true,
        approvedBy: true,
        images: {
          orderBy: { order: 'asc' }
        },
        participants: {
          include: {
            user: true,
            addedBy: true
          }
        }
      },
      orderBy: {
        deletedAt: 'desc'
      }
    });

    return models.map(ProjectsPrismaModelToProjectsEntityMapper.map);
  }

  // Método para buscar projetos por múltiplos filtros
  public async findWithFilters(filters: {
    status?: ProjectStatus;
    ownerId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ projects: Projects[]; total: number }> {
    const where: any = {
      deletedAt: null
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.ownerId) {
      where.ownerId = filters.ownerId;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [projects, total] = await Promise.all([
      prismaClient.project.findMany({
        where,
        include: {
          owner: true,
          approvedBy: true,
          images: {
            orderBy: { order: 'asc' }
          },
          participants: {
            include: {
              user: true,
              addedBy: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: filters.limit || 10,
        skip: filters.offset || 0
      }),
      prismaClient.project.count({ where })
    ]);

    return {
      projects: projects.map(ProjectsPrismaModelToProjectsEntityMapper.map),
      total
    };
  }

  // Método para estatísticas rápidas
  public async getProjectStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    archived: number;
  }> {
    const [total, pending, approved, rejected, archived] = await Promise.all([
      prismaClient.project.count({ where: { deletedAt: null } }),
      prismaClient.project.count({ where: { status: ProjectStatus.PENDING, deletedAt: null } }),
      prismaClient.project.count({ where: { status: ProjectStatus.APPROVED, deletedAt: null } }),
      prismaClient.project.count({ where: { status: ProjectStatus.REJECTED, deletedAt: null } }),
      prismaClient.project.count({ where: { status: ProjectStatus.ARCHIVED, deletedAt: null } })
    ]);

    return { total, pending, approved, rejected, archived };
  }
}
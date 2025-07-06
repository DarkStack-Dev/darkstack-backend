// src/domain/usecases/projects/delete/delete-project.usecase.ts

import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { ProjectsGatewayRepository } from '@/domain/repositories/projects/projects.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { UserNotFoundUsecaseException } from '../../exceptions/user/user-not-found.usecase.exception';
import { InvalidInputUsecaseException } from '../../exceptions/input/invalid-input.usecase.exception';
import { UserRole } from 'generated/prisma';

export type DeleteProjectInput = {
  projectId: string;
  userId: string;
  userRoles: UserRole[];
  isPermanent?: boolean; // Para hard delete
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
export class DeleteProjectUseCase implements UseCase<DeleteProjectInput, DeleteProjectOutput> {
  constructor(
    private readonly projectsRepository: ProjectsGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
  ) {}

  public async execute({
    projectId,
    userId,
    userRoles,
    isPermanent = false,
  }: DeleteProjectInput): Promise<DeleteProjectOutput> {
    console.log(`🗑️ ${isPermanent ? 'Hard' : 'Soft'} delete do projeto ${projectId} por usuário ${userId}`);

    // 1. Verificar se usuário existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundUsecaseException(
        `User not found with id ${userId} in ${DeleteProjectUseCase.name}`,
        'Usuário não encontrado',
        DeleteProjectUseCase.name,
      );
    }

    // 2. Buscar o projeto (incluindo soft deleted para hard delete)
    const project = isPermanent 
      ? await this.projectsRepository.findByIdIncludingDeleted(projectId)
      : await this.projectsRepository.findById(projectId);
    
    if (!project) {
      throw new UserNotFoundUsecaseException(
        `Project not found with id ${projectId} in ${DeleteProjectUseCase.name}`,
        'Projeto não encontrado',
        DeleteProjectUseCase.name,
      );
    }

    // 3. Verificar permissões
    this.checkDeletePermissions(project, userId, userRoles, isPermanent);

    const deletedAt = new Date();

    try {
      if (isPermanent) {
        // Hard delete - remover permanentemente
        await this.performHardDelete(project, userId);
        
        console.log(`💀 Projeto ${project.getName()} removido permanentemente`);
        
        return {
          success: true,
          message: 'Projeto removido permanentemente',
          deletedAt,
          isPermanent: true,
          project: {
            id: project.getId(),
            name: project.getName(),
            ownerId: project.getOwnerId(),
          },
        };
      } else {
        // Soft delete - marcar como deletado
        await this.performSoftDelete(projectId);
        
        console.log(`🗑️ Projeto ${project.getName()} deletado com sucesso (soft delete)`);
        
        return {
          success: true,
          message: 'Projeto deletado com sucesso',
          deletedAt,
          isPermanent: false,
          project: {
            id: project.getId(),
            name: project.getName(),
            ownerId: project.getOwnerId(),
          },
        };
      }
    } catch (error) {
      console.error(`❌ Erro ao deletar projeto ${projectId}:`, error);
      throw new InvalidInputUsecaseException(
        `Failed to delete project ${projectId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Erro ao deletar projeto',
        DeleteProjectUseCase.name,
      );
    }
  }

  private checkDeletePermissions(project: any, userId: string, userRoles: UserRole[], isPermanent: boolean): void {
    const isOwner = project.getOwnerId() === userId;
    const isAdmin = userRoles.includes(UserRole.ADMIN);
    const isModerator = userRoles.includes(UserRole.MODERATOR);

    // Para hard delete, apenas admins
    if (isPermanent) {
      if (!isAdmin) {
        throw new InvalidInputUsecaseException(
          `User ${userId} attempted permanent delete without ADMIN role`,
          'Apenas administradores podem remover projetos permanentemente',
          DeleteProjectUseCase.name,
        );
      }
      return;
    }

    // Para soft delete, owner, moderador ou admin
    if (!isOwner && !isAdmin && !isModerator) {
      throw new InvalidInputUsecaseException(
        `User ${userId} attempted to delete project ${project.getId()} without permission`,
        'Você não tem permissão para deletar este projeto',
        DeleteProjectUseCase.name,
      );
    }
  }

  private async performSoftDelete(projectId: string): Promise<void> {
    await this.projectsRepository.softDelete(projectId);
  }

  private async performHardDelete(project: any, userId: string): Promise<void> {
    // TODO: Deletar imagens do storage se necessário
    // const images = project.getImages();
    // for (const image of images) {
    //   if (image.filename) {
    //     try {
    //       await this.imageUploadService.deleteImage(image.filename, 'projects');
    //       console.log(`🗑️ Imagem deletada: ${image.filename}`);
    //     } catch (error) {
    //       console.warn(`⚠️ Erro ao deletar imagem ${image.filename}:`, error);
    //     }
    //   }
    // }

    // Hard delete do banco
    await this.projectsRepository.hardDelete(project.getId());
  }

  // Método auxiliar para restaurar projeto (bonus)
  public async restore(projectId: string, userId: string, userRoles: UserRole[]): Promise<void> {
    console.log(`🔄 Restaurando projeto ${projectId} por usuário ${userId}`);

    // Verificar permissões (apenas admin/moderador pode restaurar)
    const isAdmin = userRoles.includes(UserRole.ADMIN);
    const isModerator = userRoles.includes(UserRole.MODERATOR);

    if (!isAdmin && !isModerator) {
      throw new InvalidInputUsecaseException(
        `User ${userId} attempted to restore project without permission`,
        'Apenas administradores e moderadores podem restaurar projetos',
        DeleteProjectUseCase.name,
      );
    }

    // Buscar projeto incluindo deletados
    const project = await this.projectsRepository.findByIdIncludingDeleted(projectId);
    if (!project) {
      throw new UserNotFoundUsecaseException(
        `Project not found with id ${projectId} for restore`,
        'Projeto não encontrado',
        DeleteProjectUseCase.name,
      );
    }

    if (!project.getDeletedAt()) {
      throw new InvalidInputUsecaseException(
        `Project ${projectId} is not deleted, cannot restore`,
        'Projeto não está deletado',
        DeleteProjectUseCase.name,
      );
    }

    await this.projectsRepository.restore(projectId);
    console.log(`✅ Projeto ${project.getName()} restaurado com sucesso`);
  }
}
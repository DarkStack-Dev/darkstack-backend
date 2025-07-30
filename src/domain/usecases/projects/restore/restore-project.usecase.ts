// src/domain/usecases/projects/restore/restore-project.usecase.ts

import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { ProjectsGatewayRepository } from '@/domain/repositories/projects/projects.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { UserNotFoundUsecaseException } from '../../exceptions/user/user-not-found.usecase.exception';
import { InvalidInputUsecaseException } from '../../exceptions/input/invalid-input.usecase.exception';
import { UserRole } from 'generated/prisma';

export type RestoreProjectInput = {
  projectId: string;
  userId: string;
  userRoles: UserRole[];
};

export type RestoreProjectOutput = {
  success: boolean;
  message: string;
  restoredAt: Date;
  project: {
    id: string;
    name: string;
    ownerId: string;
  };
};

@Injectable()
export class RestoreProjectUseCase implements UseCase<RestoreProjectInput, RestoreProjectOutput> {
  constructor(
    private readonly projectsRepository: ProjectsGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
  ) {}

  public async execute({
    projectId,
    userId,
    userRoles,
  }: RestoreProjectInput): Promise<RestoreProjectOutput> {
    console.log(`🔄 Restaurando projeto ${projectId} por usuário ${userId}`);

    // 1. Verificar se usuário existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundUsecaseException(
        `User not found with id ${userId} in ${RestoreProjectUseCase.name}`,
        'Usuário não encontrado',
        RestoreProjectUseCase.name,
      );
    }

    // 2. Verificar permissões (apenas admin/moderador pode restaurar)
    this.checkRestorePermissions(userId, userRoles);

    // 3. Buscar projeto incluindo deletados
    const project = await this.projectsRepository.findByIdIncludingDeleted(projectId);
    if (!project) {
      throw new UserNotFoundUsecaseException(
        `Project not found with id ${projectId} for restore in ${RestoreProjectUseCase.name}`,
        'Projeto não encontrado',
        RestoreProjectUseCase.name,
      );
    }

    // 4. Verificar se o projeto está realmente deletado
    if (!project.getDeletedAt()) {
      throw new InvalidInputUsecaseException(
        `Project ${projectId} is not deleted, cannot restore`,
        'Projeto não está deletado',
        RestoreProjectUseCase.name,
      );
    }

    try {
      // 5. Restaurar projeto
      await this.projectsRepository.restore(projectId);
      
      const restoredAt = new Date();
      
      console.log(`✅ Projeto ${project.getName()} restaurado com sucesso`);

      return {
        success: true,
        message: 'Projeto restaurado com sucesso',
        restoredAt,
        project: {
          id: project.getId(),
          name: project.getName(),
          ownerId: project.getOwnerId(),
        },
      };
    } catch (error) {
      console.error(`❌ Erro ao restaurar projeto ${projectId}:`, error);
      throw new InvalidInputUsecaseException(
        `Failed to restore project ${projectId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Erro ao restaurar projeto',
        RestoreProjectUseCase.name,
      );
    }
  }

  private checkRestorePermissions(userId: string, userRoles: UserRole[]): void {
    const isAdmin = userRoles.includes(UserRole.ADMIN);
    const isModerator = userRoles.includes(UserRole.MODERATOR);

    if (!isAdmin && !isModerator) {
      throw new InvalidInputUsecaseException(
        `User ${userId} attempted to restore project without permission`,
        'Apenas administradores e moderadores podem restaurar projetos',
        RestoreProjectUseCase.name,
      );
    }
  }
}
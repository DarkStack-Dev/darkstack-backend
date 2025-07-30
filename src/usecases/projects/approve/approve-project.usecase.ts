// src/usecases/projects/approve/approve-project.usecase.ts

import { Injectable } from '@nestjs/common';
import { ProjectStatus, UserRole } from 'generated/prisma';
import { ProjectsGatewayRepository } from '@/domain/repositories/projects/projects.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { ProjectNotFoundUsecaseException } from '@/usecases/exceptions/projects/project-not-found.usecase.exception';
import { ProjectAccessDeniedUsecaseException } from '@/usecases/exceptions/projects/project-access-denied.usecase.exception';
import { UserNotFoundUsecaseException } from '@/usecases/exceptions/user/user-not-found.usecase.exception';
import { Usecase } from '@/usecases/usecase';

export type ApproveProjectInput = {
  projectId: string;
  moderatorId: string;
  moderatorRoles: UserRole[];
  action: 'approve' | 'reject';
  reason?: string; // Obrigatório para rejeição
  comments?: string; // Comentários opcionais
};

export type ApproveProjectOutput = {
  success: boolean;
  message: string;
  project: {
    id: string;
    name: string;
    status: ProjectStatus;
    ownerId: string;
  };
  moderator: {
    id: string;
    name: string;
    email: string;
  };
  approvedAt?: Date;
  rejectionReason?: string;
  processedAt: Date;
};

@Injectable()
export class ApproveProjectUsecase implements Usecase<ApproveProjectInput, ApproveProjectOutput> {
  public constructor(
    private readonly projectsRepository: ProjectsGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
  ) {}

  public async execute({
    projectId,
    moderatorId,
    moderatorRoles,
    action,
    reason,
    comments,
  }: ApproveProjectInput): Promise<ApproveProjectOutput> {
    console.log(`🔍 ${action === 'approve' ? 'Aprovando' : 'Rejeitando'} projeto ${projectId} por moderador ${moderatorId}`);

    // 1. Verificar permissões do moderador
    this.checkModeratorPermissions(moderatorRoles);

    // 2. Verificar se moderador existe
    const moderator = await this.userRepository.findById(moderatorId);
    if (!moderator) {
      throw new UserNotFoundUsecaseException(
        `Moderator not found with id ${moderatorId} in ${ApproveProjectUsecase.name}`,
        'Moderador não encontrado',
        ApproveProjectUsecase.name,
      );
    }

    // 3. Buscar o projeto
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundUsecaseException(
        `Project not found with id ${projectId} in ${ApproveProjectUsecase.name}`,
        'Projeto não encontrado',
        ApproveProjectUsecase.name,
      );
    }

    // 4. Verificar se projeto pode ser moderado
    this.validateProjectCanBeModerated(project);

    // 5. Validar dados de entrada
    this.validateInput(action, reason);

    const processedAt = new Date();

    try {
      if (action === 'approve') {
        // Aprovar projeto
        await this.projectsRepository.approveProject(
          projectId,
          moderatorId,
          processedAt
        );

        console.log(`✅ Projeto ${project.getName()} aprovado por ${moderator.getName()}`);

        return {
          success: true,
          message: 'Projeto aprovado com sucesso',
          project: {
            id: project.getId(),
            name: project.getName(),
            status: ProjectStatus.APPROVED,
            ownerId: project.getOwnerId(),
          },
          moderator: {
            id: moderator.getId(),
            name: moderator.getName(),
            email: moderator.getEmail(),
          },
          approvedAt: processedAt,
          processedAt,
        };
      } else {
        // Rejeitar projeto
        await this.projectsRepository.rejectProject(
          projectId,
          reason || 'Sem motivo especificado'
        );

        console.log(`❌ Projeto ${project.getName()} rejeitado por ${moderator.getName()}: ${reason}`);

        return {
          success: true,
          message: 'Projeto rejeitado',
          project: {
            id: project.getId(),
            name: project.getName(),
            status: ProjectStatus.REJECTED,
            ownerId: project.getOwnerId(),
          },
          moderator: {
            id: moderator.getId(),
            name: moderator.getName(),
            email: moderator.getEmail(),
          },
          rejectionReason: reason,
          processedAt,
        };
      }
    } catch (error) {
      console.error(`❌ Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} projeto ${projectId}:`, error);
      throw new ProjectAccessDeniedUsecaseException(
        `Failed to ${action} project ${projectId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        `Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} projeto`,
        ApproveProjectUsecase.name,
      );
    }
  }

  private checkModeratorPermissions(moderatorRoles: UserRole[]): void {
    const isAdmin = moderatorRoles.includes(UserRole.ADMIN);
    const isModerator = moderatorRoles.includes(UserRole.MODERATOR);

    if (!isAdmin && !isModerator) {
      throw new ProjectAccessDeniedUsecaseException(
        'User attempted to moderate project without permission',
        'Apenas administradores e moderadores podem moderar projetos',
        ApproveProjectUsecase.name,
      );
    }
  }

  private validateProjectCanBeModerated(project: any): void {
    // Verificar se projeto está deletado
    if (project.getDeletedAt()) {
      throw new ProjectAccessDeniedUsecaseException(
        `Cannot moderate deleted project ${project.getId()}`,
        'Não é possível moderar projetos deletados',
        ApproveProjectUsecase.name,
      );
    }

    // Verificar se projeto não está ativo
    if (!project.getIsActivate()) {
      throw new ProjectAccessDeniedUsecaseException(
        `Cannot moderate inactive project ${project.getId()}`,
        'Não é possível moderar projetos inativos',
        ApproveProjectUsecase.name,
      );
    }

    // Verificar se projeto já foi processado
    if (project.getStatus() === ProjectStatus.APPROVED) {
      throw new ProjectAccessDeniedUsecaseException(
        `Project ${project.getId()} is already approved`,
        'Projeto já foi aprovado',
        ApproveProjectUsecase.name,
      );
    }
  }

  private validateInput(action: string, reason?: string): void {
    if (action === 'reject') {
      if (!reason || reason.trim().length === 0) {
        throw new ProjectAccessDeniedUsecaseException(
          'Rejection reason is required',
          'Motivo da rejeição é obrigatório',
          ApproveProjectUsecase.name,
        );
      }

      if (reason.trim().length > 1000) {
        throw new ProjectAccessDeniedUsecaseException(
          'Rejection reason must not exceed 1000 characters',
          'Motivo da rejeição não pode exceder 1000 caracteres',
          ApproveProjectUsecase.name,
        );
      }
    }
  }
}
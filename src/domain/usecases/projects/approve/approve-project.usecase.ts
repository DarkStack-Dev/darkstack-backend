// src/domain/usecases/projects/approve/approve-project.usecase.ts - ATUALIZADO COM NOTIFICAÇÕES

import { Injectable } from '@nestjs/common';
import { ProjectStatus, UserRole } from 'generated/prisma';
import { ProjectsGatewayRepository } from '@/domain/repositories/projects/projects.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { NotificationGatewayRepository } from '@/domain/repositories/notification/notification.gateway.repository';
import { ProjectNotFoundUsecaseException } from '@/usecases/exceptions/projects/project-not-found.usecase.exception';
import { ProjectAccessDeniedUsecaseException } from '@/usecases/exceptions/projects/project-access-denied.usecase.exception';
import { UserNotFoundUsecaseException } from '@/usecases/exceptions/user/user-not-found.usecase.exception';
import { Notification } from '@/domain/entities/notification/notification.entity';
import { NotificationGateway } from '@/infra/websocket/notification.gateway';
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
    private readonly notificationRepository: NotificationGatewayRepository, // ✅ NOVO
    private readonly notificationGateway: NotificationGateway, // ✅ NOVO: WebSocket
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

    // 4. Buscar o dono do projeto para notificação
    const projectOwner = await this.userRepository.findById(project.getOwnerId());
    if (!projectOwner) {
      throw new UserNotFoundUsecaseException(
        `Project owner not found with id ${project.getOwnerId()} in ${ApproveProjectUsecase.name}`,
        'Proprietário do projeto não encontrado',
        ApproveProjectUsecase.name,
      );
    }

    // 5. Verificar se projeto pode ser moderado
    this.validateProjectCanBeModerated(project);

    // 6. Validar dados de entrada
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

        // ✅ NOVO: Notificar dono sobre aprovação
        await this.notifyOwnerApproval(project, projectOwner, moderator);

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

        // ✅ NOVO: Notificar dono sobre rejeição
        await this.notifyOwnerRejection(project, projectOwner, moderator, reason);

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

  // ✅ NOVO: Notificar dono sobre aprovação
  private async notifyOwnerApproval(project: any, owner: any, moderator: any): Promise<void> {
    try {
      // 1. Criar notificação usando factory method
      const notification = Notification.createProjectApproved(
        project.getId(),
        project.getName(),
        owner.getId(),
        moderator.getId()
      );

      // 2. Persistir no banco
      await this.notificationRepository.create(notification);

      // 3. Enviar via WebSocket se usuário estiver online
      const notificationData = {
        id: notification.getId(),
        type: 'PROJECT_APPROVED',
        title: 'Projeto aprovado! 🎉',
        message: `Seu projeto "${project.getName()}" foi aprovado e já está disponível para visualização.`,
        projectId: project.getId(),
        projectName: project.getName(),
        moderatorName: moderator.getName(),
        isRead: false,
        createdAt: notification.getCreatedAt(),
        metadata: {
          action: 'view',
          url: `/projects/${project.getId()}`,
          moderatorId: moderator.getId(),
          moderatorName: moderator.getName(),
        },
      };

      const wasSent = this.notificationGateway.sendNotificationToUser(owner.getId(), notificationData);
      
      console.log(`📢 Notificação de aprovação enviada para ${owner.getName()} ${wasSent ? '(online)' : '(offline - receberá quando conectar)'}`);

    } catch (error) {
      // Log mas não falha o processo de aprovação
      console.error(`⚠️ Erro ao notificar dono sobre aprovação do projeto ${project.getId()}:`, error);
    }
  }

  // ✅ NOVO: Notificar dono sobre rejeição
  private async notifyOwnerRejection(project: any, owner: any, moderator: any, reason?: string): Promise<void> {
    try {
      // 1. Criar notificação usando factory method
      const notification = Notification.createProjectRejected(
        project.getId(),
        project.getName(),
        owner.getId(),
        moderator.getId(),
        reason
      );

      // 2. Persistir no banco
      await this.notificationRepository.create(notification);

      // 3. Enviar via WebSocket se usuário estiver online
      const notificationData = {
        id: notification.getId(),
        type: 'PROJECT_REJECTED',
        title: 'Projeto necessita ajustes',
        message: `Seu projeto "${project.getName()}" precisa de alguns ajustes antes da publicação.${reason ? ` Motivo: ${reason}` : ''}`,
        projectId: project.getId(),
        projectName: project.getName(),
        moderatorName: moderator.getName(),
        rejectionReason: reason,
        isRead: false,
        createdAt: notification.getCreatedAt(),
        metadata: {
          action: 'edit',
          url: `/projects/${project.getId()}/edit`,
          moderatorId: moderator.getId(),
          moderatorName: moderator.getName(),
          rejectionReason: reason,
        },
      };

      const wasSent = this.notificationGateway.sendNotificationToUser(owner.getId(), notificationData);
      
      console.log(`📢 Notificação de rejeição enviada para ${owner.getName()} ${wasSent ? '(online)' : '(offline - receberá quando conectar)'}`);

    } catch (error) {
      // Log mas não falha o processo de rejeição
      console.error(`⚠️ Erro ao notificar dono sobre rejeição do projeto ${project.getId()}:`, error);
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
// src/domain/usecases/projects/find-by-id/find-project-by-id.usecase.ts

import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { ProjectsGatewayRepository } from '@/domain/repositories/projects/projects.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { UserNotFoundUsecaseException } from '../../exceptions/user/user-not-found.usecase.exception';
import { ProjectStatus, UserRole } from 'generated/prisma';

export type FindProjectByIdInput = {
  projectId: string;
  currentUserId?: string; // Usuário atual (pode ser undefined se não autenticado)
};

export type ProjectOwnerData = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

export type ProjectParticipantData = {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  role?: string;
  joinedAt: Date;
};

export type ProjectImageData = {
  id: string;
  filename: string;
  url: string;
  isMain: boolean;
  order: number;
  width?: number;
  height?: number;
  size?: number;
};

export type FindProjectByIdOutput = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  isActive: boolean;
  
  // Dados do proprietário
  owner: ProjectOwnerData;
  
  // Dados de moderação
  approvedById?: string;
  approvedBy?: {
    id: string;
    name: string;
    email: string;
  };
  approvedAt?: Date;
  rejectionReason?: string;
  
  // Imagens do projeto
  images: ProjectImageData[];
  
  // Participantes
  participants: ProjectParticipantData[];
  participantCount: number;
  imageCount: number;
  
  // Permissões do usuário atual
  isOwner: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canView: boolean;
};

@Injectable()
export class FindProjectByIdUseCase implements UseCase<FindProjectByIdInput, FindProjectByIdOutput> {
  constructor(
    private readonly projectsRepository: ProjectsGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
  ) {}

  public async execute({ projectId, currentUserId }: FindProjectByIdInput): Promise<FindProjectByIdOutput> {
    console.log(`🔍 Buscando projeto ID: ${projectId} para usuário: ${currentUserId || 'anonymous'}`);

    // 1. Buscar o projeto
    const project = await this.projectsRepository.findById(projectId);
    
    if (!project) {
      throw new UserNotFoundUsecaseException(
        `Project not found with id ${projectId} in ${FindProjectByIdUseCase.name}`,
        'Projeto não encontrado',
        FindProjectByIdUseCase.name,
      );
    }

    // 2. Verificar permissões de visualização
    const isOwner = currentUserId === project.getOwnerId();
    const canView = this.checkViewPermission(project, currentUserId, isOwner);
    
    if (!canView) {
      throw new UserNotFoundUsecaseException(
        `Project ${projectId} is not accessible to user ${currentUserId} in ${FindProjectByIdUseCase.name}`,
        'Projeto não encontrado',
        FindProjectByIdUseCase.name,
      );
    }

    // 3. Buscar dados do proprietário
    const owner = await this.userRepository.findById(project.getOwnerId());
    if (!owner) {
      throw new UserNotFoundUsecaseException(
        `Project owner not found with id ${project.getOwnerId()} in ${FindProjectByIdUseCase.name}`,
        'Dados do proprietário não encontrados',
        FindProjectByIdUseCase.name,
      );
    }

    // 4. Buscar dados do moderador que aprovou (se houver)
    let approvedBy: { id: string; name: string; email: string } | undefined;
    if (project.getApprovedById()) {
      const approver = await this.userRepository.findById(project.getApprovedById()!);
      if (approver) {
        approvedBy = {
          id: approver.getId(),
          name: approver.getName(),
          email: approver.getEmail(),
        };
      }
    }

    // 5. Buscar dados dos participantes
    const participants: ProjectParticipantData[] = [];
    const projectParticipants = project.getParticipants() || [];
    
    for (const participant of projectParticipants) {
      const participantUser = await this.userRepository.findById(participant.userId);
      if (participantUser) {
        participants.push({
          id: participant.id,
          user: {
            id: participantUser.getId(),
            name: participantUser.getName(),
            email: participantUser.getEmail(),
            avatar: participantUser.getAvatar(),
          },
          role: participant.role || undefined,
          joinedAt: participant.joinedAt,
        });
      }
    }

    // 6. Processar imagens
    const images: ProjectImageData[] = project.getImages().map(image => ({
      id: image.id,
      filename: image.filename,
      url: image.url || '',
      isMain: image.isMain,
      order: image.order,
      width: image.width || undefined,
      height: image.height || undefined,
      size: image.size || undefined,
    }));

    // 7. Calcular permissões
    const permissions = this.calculatePermissions(project, currentUserId, isOwner);

    console.log(`✅ Projeto encontrado: ${project.getName()}`);
    console.log(`👤 Proprietário: ${owner.getName()}`);
    console.log(`🖼️ Imagens: ${images.length}`);
    console.log(`👥 Participantes: ${participants.length}`);

    return {
      id: project.getId(),
      name: project.getName(),
      description: project.getDescription(),
      status: project.getStatus(),
      createdAt: project.getCreatedAt(),
      updatedAt: project.getUpdatedAt(),
      deletedAt: project.getDeletedAt(),
      isActive: project.getIsActivate(),
      
      // Dados do proprietário
      owner: {
        id: owner.getId(),
        name: owner.getName(),
        email: owner.getEmail(),
        avatar: owner.getAvatar(),
      },
      
      // Dados de moderação
      approvedById: project.getApprovedById(),
      approvedBy,
      approvedAt: project.getApprovedAt(),
      rejectionReason: project.getRejectionReason(),
      
      // Conteúdo do projeto
      images,
      participants,
      participantCount: participants.length,
      imageCount: images.length,
      
      // Permissões
      isOwner,
      canEdit: permissions.canEdit ?? false,
      canDelete: permissions.canDelete ?? false,
      canView: permissions.canView ?? false,
    };
  }

  private checkViewPermission(project: any, currentUserId?: string, isOwner?: boolean): boolean {
    // Proprietário sempre pode ver
    if (isOwner) {
      return true;
    }

    // Projetos aprovados são públicos
    if (project.getStatus() === ProjectStatus.APPROVED && project.getIsActivate()) {
      return true;
    }

    // Participantes podem ver projetos pendentes/rejeitados
    const participants = project.getParticipants() || [];
    const isParticipant = currentUserId && participants.some((p: any) => p.userId === currentUserId);
    if (isParticipant) {
      return true;
    }

    // TODO: Implementar verificação de roles de moderador/admin
    // if (userRoles?.includes(UserRole.ADMIN) || userRoles?.includes(UserRole.MODERATOR)) {
    //   return true;
    // }

    return false;
  }

  private calculatePermissions(project: any, currentUserId?: string, isOwner?: boolean) {
    const canView = this.checkViewPermission(project, currentUserId, isOwner);
    
    // Apenas o proprietário pode editar/deletar (por enquanto)
    const canEdit = isOwner && project.getIsActivate();
    const canDelete = isOwner;

    // TODO: Implementar permissões para moderadores
    // const isModerator = userRoles?.includes(UserRole.ADMIN) || userRoles?.includes(UserRole.MODERATOR);
    // if (isModerator) {
    //   canEdit = true;
    //   canDelete = true;
    // }

    return {
      canView,
      canEdit,
      canDelete,
    };
  }
}
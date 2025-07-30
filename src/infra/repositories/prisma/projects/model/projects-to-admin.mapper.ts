// ===== MAPPER: PARA ADMIN/MODERAÇÃO =====

import { Projects } from "@/domain/entities/projects/projects.entity";

// ===== MAPPER: PARA ADMIN/MODERAÇÃO =====

export class ProjectsToAdminResponseMapper {
  public static map(projects: Projects, includeOwnerData = false) {
    const response: any = {
      id: projects.getId(),
      name: projects.getName(),
      description: projects.getDescription(),
      status: projects.getStatus(),
      
      // IDs para relações
      ownerId: projects.getOwnerId(),
      approvedById: projects.getApprovedById(),
      
      // Dados de moderação
      approvedAt: projects.getApprovedAt(),
      rejectionReason: projects.getRejectionReason(),
      
      // Estatísticas
      participantCount: projects.getParticipants()?.length || 0,
      imageCount: projects.getImages().length,
      
      // Timestamps completos
      createdAt: projects.getCreatedAt(),
      updatedAt: projects.getUpdatedAt(),
      deletedAt: projects.getDeletedAt(),
      isActive: projects.getIsActivate(),
      
      // Imagens com metadados completos
      images: projects.getImages().map(image => ({
        id: image.id,
        filename: image.filename,
        type: image.type,
        size: image.size,
        width: image.width,
        height: image.height,
        hasBase64: !!image.base64,
        hasUrl: !!image.url,
        metadata: image.metadata,
        isMain: image.isMain,
        order: image.order
      }))
    };

    return response;
  }
}
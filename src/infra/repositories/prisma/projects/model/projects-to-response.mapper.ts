// ===== MAPPER ADICIONAL: PARA RESPONSES/DTOs =====

import { Projects } from "@/domain/entities/projects/projects.entity";

export class ProjectsToResponseMapper {
  public static map(projects: Projects) {
    return {
      id: projects.getId(),
      name: projects.getName(),
      description: projects.getDescription(),
      status: projects.getStatus(),
      
      // Dados do proprietário (buscar via relação quando necessário)
      ownerId: projects.getOwnerId(),
      
      // Aprovação
      approvedById: projects.getApprovedById(),
      approvedAt: projects.getApprovedAt(),
      rejectionReason: projects.getRejectionReason(),
      
      // Imagens (apenas dados principais para response)
      images: projects.getImages().map(image => ({
        id: image.id,
        filename: image.filename,
        type: image.type,
        url: image.url, // Preferencialmente URL em vez de base64
        isMain: image.isMain,
        order: image.order
      })),
      
      // Contadores
      participantCount: projects.getParticipants()?.length || 0,
      imageCount: projects.getImages().length,
      
      // Timestamps
      createdAt: projects.getCreatedAt(),
      updatedAt: projects.getUpdatedAt(),
      isActive: projects.getIsActivate()
    };
  }

  public static mapList(projectsList: Projects[]) {
    return projectsList.map(this.map);
  }
}

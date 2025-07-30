// ===== MAPPER: ENTITY → PRISMA MODEL =====

import { Projects } from "@/domain/entities/projects/projects.entity";

export class ProjectsEntityToProjectsPrismaModelMapper {
  public static map(projects: Projects) {
    return {
      id: projects.getId(),
      name: projects.getName(),
      description: projects.getDescription(),
      status: projects.getStatus(),
      ownerId: projects.getOwnerId(),
      
      // APENAS campos escalares para evitar conflitos de tipo
      approvedById: projects.getApprovedById(),
      approvedAt: projects.getApprovedAt(),
      rejectionReason: projects.getRejectionReason(),
      
      // Timestamps
      createdAt: projects.getCreatedAt(),
      updatedAt: projects.getUpdatedAt(),
      deletedAt: projects.getDeletedAt(),
      
      // Participantes (mapeamento simples para createMany se necessário)
      participants: projects.getParticipants()?.map(participant => ({
        id: participant.id,
        projectId: participant.projectId,
        userId: participant.userId,
        addedById: participant.addedById,
        role: participant.role,
        joinedAt: participant.joinedAt
      })),
      
      // Imagens mapeadas corretamente
      images: projects.getImages().map((image, index) => ({
        id: image.id,
        filename: image.filename,
        type: image.type,
        size: image.size,
        width: image.width,
        height: image.height,
        base64: image.base64,
        url: image.url,
        metadata: image.metadata,
        order: image.order ?? index,
        isMain: image.isMain,
        createdAt: image.createdAt,
        updatedAt: image.updatedAt
      }))
      
      // REMOVIDOS campos de relação que causam conflito:
      // - approvedBy (relação)
      // - owner (relação) 
      // - isActive (não existe no Prisma)
    };
  }
}

// ===== MAPPER: PRISMA MODEL → ENTITY =====

import { Projects } from "@/domain/entities/projects/projects.entity";

export class ProjectsPrismaModelToProjectsEntityMapper {
  public static map(model: any): Projects {
    return Projects.with({
      id: model.id,
      name: model.name,
      description: model.description,
      status: model.status,
      ownerId: model.ownerId,
      
      // CORRIGIDO: approvedById (singular)
      approvedById: model.approvedById,
      approvedAt: model.approvedAt,
      rejectionReason: model.rejectionReason,
      
      // Timestamps
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      deletedAt: model.deletedAt, // ADICIONADO
      
      // isActive baseado em deletedAt (se não foi deletado = ativo)
      isActive: !model.deletedAt,
      
      // Participantes (podem vir das includes)
      participants: model.participants || [],
      
      // Imagens (podem vir das includes)
      images: model.images ? model.images.map((image: any) => ({
        id: image.id,
        projectId: image.projectId || model.id,
        filename: image.filename,
        type: image.type,
        size: image.size,
        width: image.width,
        height: image.height,
        base64: image.base64,
        url: image.url,
        metadata: image.metadata,
        order: image.order,
        isMain: image.isMain,
        createdAt: image.createdAt,
        updatedAt: image.updatedAt
      })) : [],
      
      // REMOVIDO: owner completo (apenas ownerId necessário na entidade)
      // Se precisar dos dados do owner, fazer um join separado ou buscar quando necessário
    });
  }
}
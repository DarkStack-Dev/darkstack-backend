// src/infra/web/routes/projects/my-projects/my-projects.presenter.ts - ATUALIZADO

import { MyProjectsOutput } from '@/usecases/projects/my-projects/my-projects.usecase'; // ✅ CORRIGIDO
import { MyProjectsResponse } from './my-projects.dto';

export class MyProjectsPresenter {
  public static toHttp(output: MyProjectsOutput): MyProjectsResponse {
    return {
      projects: output.projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        deletedAt: project.deletedAt,
        
        // Imagem principal
        mainImage: project.mainImage,
        
        // Contadores
        participantCount: project.participantCount,
        imageCount: project.imageCount,
        
        // Informações de moderação
        approvedAt: project.approvedAt,
        rejectionReason: project.rejectionReason,
        isActive: project.isActive,
      })),
      stats: output.stats,
      pagination: output.pagination,
    };
  }
}

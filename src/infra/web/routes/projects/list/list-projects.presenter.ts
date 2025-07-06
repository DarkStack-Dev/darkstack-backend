// src/infra/web/routes/projects/list/list-projects.presenter.ts - ATUALIZADA

import { ListProjectsOutput } from '@/domain/usecases/projects/list/list-projects.usecase';
import { ListProjectsResponse } from './list-projects.dto';

export class ListProjectsPresenter {
  public static toHttp(output: ListProjectsOutput): ListProjectsResponse {
    return {
      projects: output.projects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        
        // Dados do proprietário agora vem do use case
        owner: {
          id: project.owner.id,
          name: project.owner.name,
          avatar: project.owner.avatar,
        },
        
        // Imagem principal se existir
        mainImage: project.mainImage,
        
        // Contadores
        participantCount: project.participantCount,
        imageCount: project.imageCount,
      })),
      pagination: output.pagination,
    };
  }
}
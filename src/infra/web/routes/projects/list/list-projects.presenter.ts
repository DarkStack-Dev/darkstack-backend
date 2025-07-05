// ===== PRESENTER =====

// src/infra/web/routes/projects/list/list-projects.presenter.ts

import { Projects } from '@/domain/entities/projects/projects.entity';
import { ListProjectsResponse } from './list-projects.dto';

export class ListProjectsPresenter {
  public static toHttp(
    projects: Projects[], 
    total: number, 
    page: number, 
    limit: number
  ): ListProjectsResponse {
    const totalPages = Math.ceil(total / limit);
    
    return {
      projects: projects.map(project => ({
        id: project.getId(),
        name: project.getName(),
        description: project.getDescription().length > 150 
          ? project.getDescription().substring(0, 150) + '...'
          : project.getDescription(),
        status: project.getStatus(),
        createdAt: project.getCreatedAt(),
        updatedAt: project.getUpdatedAt(),
        owner: {
          id: project.getOwnerId(),
          name: 'Unknown', // TODO: Incluir dados do owner via join
          avatar: undefined,
        },
        mainImage: (() => {
          const mainImg = project.getImages().find(img => img.isMain);
          return mainImg ? {
            url: mainImg.url || '',
            filename: mainImg.filename,
          } : undefined;
        })(),
        participantCount: project.getParticipants()?.length || 0,
        imageCount: project.getImages().length,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }
}
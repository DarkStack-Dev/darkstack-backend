// ===== PRESENTER =====

// src/infra/web/routes/projects/my-projects/my-projects.presenter.ts

import { Projects } from '@/domain/entities/projects/projects.entity';
import { MyProjectsResponse } from './my-projects.dto';

export class MyProjectsPresenter {
  public static toHttp(
    projects: Projects[], 
    stats: any,
    total: number, 
    page: number, 
    limit: number
  ): MyProjectsResponse {
    const totalPages = Math.ceil(total / limit);
    
    return {
      projects: projects.map(project => ({
        id: project.getId(),
        name: project.getName(),
        description: project.getDescription().length > 100 
          ? project.getDescription().substring(0, 100) + '...'
          : project.getDescription(),
        status: project.getStatus(),
        createdAt: project.getCreatedAt(),
        updatedAt: project.getUpdatedAt(),
        deletedAt: project.getDeletedAt(),
        mainImage: (() => {
          const mainImg = project.getImages().find(img => img.isMain);
          return mainImg ? {
            url: mainImg.url || '',
            filename: mainImg.filename,
          } : undefined;
        })(),
        participantCount: project.getParticipants()?.length || 0,
        imageCount: project.getImages().length,
        approvedAt: project.getApprovedAt(),
        rejectionReason: project.getRejectionReason(),
        isActive: project.getIsActivate(),
      })),
      stats,
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
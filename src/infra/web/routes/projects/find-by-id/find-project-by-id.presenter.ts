// ===== PRESENTER =====

// src/infra/web/routes/projects/find-by-id/find-project-by-id.presenter.ts

import { Projects } from '@/domain/entities/projects/projects.entity';
import { FindProjectByIdResponse } from './find-project-by-id.dto';

export class FindProjectByIdPresenter {
  public static toHttp(project: Projects, currentUserId?: string): FindProjectByIdResponse {
    return {
      id: project.getId(),
      name: project.getName(),
      description: project.getDescription(),
      status: project.getStatus(),
      createdAt: project.getCreatedAt(),
      updatedAt: project.getUpdatedAt(),
      owner: {
        id: project.getOwnerId(),
        name: 'Unknown', // TODO: Buscar dados do owner
        email: 'unknown@example.com',
        avatar: undefined,
      },
      images: project.getImages().map(image => ({
        id: image.id,
        filename: image.filename,
        url: image.url || '',
        isMain: image.isMain,
        order: image.order,
      })),
      participants: project.getParticipants()?.map(participant => {
        const base = {
          id: participant.id,
          user: {
            id: participant.userId,
            name: 'Unknown', // TODO: Buscar dados do usuário
            email: 'unknown@example.com',
          },
          joinedAt: participant.joinedAt,
        };
        return participant.role != null
          ? { ...base, role: participant.role }
          : base;
      }) || [],
      participantCount: project.getParticipants()?.length || 0,
      isOwner: currentUserId === project.getOwnerId(),
    };
  }
}

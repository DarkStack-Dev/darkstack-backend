// src/infra/web/routes/projects/find-by-id/find-project-by-id.presenter.ts - ATUALIZADA

import { FindProjectByIdOutput } from '@/domain/usecases/projects/find-by-id/find-project-by-id.usecase';
import { FindProjectByIdResponse } from './find-project-by-id.dto';

export class FindProjectByIdPresenter {
  public static toHttp(output: FindProjectByIdOutput): FindProjectByIdResponse {
    return {
      id: output.id,
      name: output.name,
      description: output.description,
      status: output.status,
      createdAt: output.createdAt,
      updatedAt: output.updatedAt,
      
      // Dados do proprietário (agora vem do use case)
      owner: {
        id: output.owner.id,
        name: output.owner.name,
        email: output.owner.email,
        avatar: output.owner.avatar,
      },
      
      // Imagens processadas
      images: output.images.map(image => ({
        id: image.id,
        filename: image.filename,
        url: image.url,
        isMain: image.isMain,
        order: image.order,
      })),
      
      // Participantes com dados completos (agora vem do use case)
      participants: output.participants.map(participant => ({
        id: participant.id,
        user: {
          id: participant.user.id,
          name: participant.user.name,
          email: participant.user.email,
        },
        role: participant.role,
        joinedAt: participant.joinedAt,
      })),
      
      // Contadores
      participantCount: output.participantCount,
      
      // Permissões
      isOwner: output.isOwner,
    };
  }
}
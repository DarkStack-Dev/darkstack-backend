// src/usecases/projects/find-by-id/find-project-by-id.usecase.ts

import { Injectable } from '@nestjs/common';
import { ProjectStatus } from 'generated/prisma';
import { FindProjectByIdUseCase as DomainFindProjectByIdUseCase } from '@/domain/usecases/projects/find-by-id/find-project-by-id.usecase';
import { ProjectNotFoundUsecaseException } from '@/usecases/exceptions/projects/project-not-found.usecase.exception';
import { ProjectAccessDeniedUsecaseException } from '@/usecases/exceptions/projects/project-access-denied.usecase.exception';
import { Usecase } from '@/usecases/usecase';

export type FindProjectByIdInput = {
  projectId: string;
  currentUserId?: string;
};

export type FindProjectByIdOutput = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  images: {
    id: string;
    filename: string;
    url: string;
    isMain: boolean;
    order: number;
  }[];
  participants: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
    role?: string;
    joinedAt: Date;
  }[];
  participantCount: number;
  isOwner: boolean;
};

@Injectable()
export class FindProjectByIdUsecase implements Usecase<FindProjectByIdInput, FindProjectByIdOutput> {
  public constructor(
    private readonly domainFindProjectByIdUseCase: DomainFindProjectByIdUseCase,
  ) {}

  public async execute({
    projectId,
    currentUserId,
  }: FindProjectByIdInput): Promise<FindProjectByIdOutput> {
    try {
      const result = await this.domainFindProjectByIdUseCase.execute({
        projectId,
        currentUserId,
      });

      return {
        id: result.id,
        name: result.name,
        description: result.description,
        status: result.status,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        owner: {
          id: result.owner.id,
          name: result.owner.name,
          email: result.owner.email,
          avatar: result.owner.avatar,
        },
        images: result.images.map(image => ({
          id: image.id,
          filename: image.filename,
          url: image.url,
          isMain: image.isMain,
          order: image.order,
        })),
        participants: result.participants.map(participant => ({
          id: participant.id,
          user: {
            id: participant.user.id,
            name: participant.user.name,
            email: participant.user.email,
          },
          role: participant.role,
          joinedAt: participant.joinedAt,
        })),
        participantCount: result.participantCount,
        isOwner: result.isOwner,
      };
    } catch (error) {
      // Mapear exceptions do domínio para exceptions da aplicação
      if (error.name === 'UserNotFoundUsecaseException') {
        throw new ProjectNotFoundUsecaseException(
          error.internalMessage || `Project not found with id ${projectId} in ${FindProjectByIdUsecase.name}`,
          error.externalMessage || 'Projeto não encontrado.',
          FindProjectByIdUsecase.name,
        );
      }

      // Re-lançar outros erros
      throw error;
    }
  }
}
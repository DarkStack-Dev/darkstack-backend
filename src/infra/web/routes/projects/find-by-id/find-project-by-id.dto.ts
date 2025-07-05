// src/infra/web/routes/projects/find-by-id/find-project-by-id.dto.ts

import { ProjectStatus, UserRole } from "generated/prisma";

export type FindProjectByIdResponse = {
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
  isOwner: boolean; // Se o usuário logado é o dono
};
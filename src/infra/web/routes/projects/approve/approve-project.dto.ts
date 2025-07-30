// src/infra/web/routes/projects/approve/approve-project.dto.ts

import { ProjectStatus } from "generated/prisma";

export type ApproveProjectRequest = {
  action: 'approve' | 'reject';
  reason?: string; // Obrigatório para rejeição
  comments?: string; // Comentários opcionais
};

export type ApproveProjectResponse = {
  success: boolean;
  message: string;
  project: {
    id: string;
    name: string;
    status: ProjectStatus;
    ownerId: string;
  };
  moderator: {
    id: string;
    name: string;
    email: string;
  };
  approvedAt?: Date;
  rejectionReason?: string;
  processedAt: Date;
};
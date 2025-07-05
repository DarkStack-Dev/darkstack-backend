// src/infra/web/routes/projects/my-projects/my-projects.dto.ts

import { ProjectStatus } from "generated/prisma";

export type MyProjectsQuery = {
  page?: string;
  limit?: string;
  status?: ProjectStatus;
  includeDeleted?: string; // 'true' | 'false'
};

export type MyProjectSummary = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  mainImage?: {
    url: string;
    filename: string;
  };
  participantCount: number;
  imageCount: number;
  // Informações de moderação (apenas para o dono)
  approvedAt?: Date;
  rejectionReason?: string;
  isActive: boolean;
};

export type MyProjectsResponse = {
  projects: MyProjectSummary[];
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    archived: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
};
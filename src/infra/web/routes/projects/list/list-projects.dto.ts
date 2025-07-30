// src/infra/web/routes/projects/list/list-projects.dto.ts

import { ProjectStatus } from "generated/prisma";

export type ListProjectsQuery = {
  page?: string;
  limit?: string;
  status?: ProjectStatus;
  search?: string;
  ownerId?: string;
};

export type ProjectSummary = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: string;
    name: string;
    avatar?: string;
  };
  mainImage?: {
    url: string;
    filename: string;
  };
  participantCount: number;
  imageCount: number;
};

export type ListProjectsResponse = {
  projects: ProjectSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
};
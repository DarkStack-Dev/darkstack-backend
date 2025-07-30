// src/infra/web/routes/projects/update/update-project.dto.ts

import { ImageType, ProjectStatus } from "generated/prisma";

export type ProjectImageUpdateRequest = {
  id?: string;
  filename: string;
  type: ImageType;
  size?: number;
  width?: number;
  height?: number;
  base64?: string;
  url?: string;
  metadata?: any;
  isMain?: boolean;
  order?: number;
  shouldDelete?: boolean;
};

export type UpdateProjectRequest = {
  name?: string;
  description?: string;
  images?: ProjectImageUpdateRequest[];
  shouldResetStatus?: boolean;
};

export type UpdateProjectResponse = {
  success: boolean;
  message: string;
  project: {
    id: string;
    name: string;
    description: string;
    status: ProjectStatus;
    updatedAt: Date;
  };
  images: {
    id: string;
    filename: string;
    url: string;
    isMain: boolean;
    order: number;
  }[];
  statusChanged: boolean;
};

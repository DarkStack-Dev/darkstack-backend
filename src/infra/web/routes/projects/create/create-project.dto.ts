// src/infra/web/routes/projects/create/create-project.dto.ts

import { ImageType, ProjectStatus } from "generated/prisma";

export type ProjectImageRequest = {
  filename: string;
  type: ImageType;
  base64: string; // Imagem em base64
  isMain?: boolean;
};

export type CreateProjectRequest = {
  name: string;
  description: string;
  images: ProjectImageRequest[];
};

export type CreateProjectResponse = {
  id: string;
  name: string;
  status: ProjectStatus;
  createdAt: Date;
  images: {
    id: string;
    url: string;
    filename: string;
    isMain: boolean;
  }[];
};
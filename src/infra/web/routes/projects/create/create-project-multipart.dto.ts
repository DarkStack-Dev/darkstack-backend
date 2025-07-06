import { ImageType, ProjectStatus } from "generated/prisma";

export type CreateProjectMultipartRequest = {
  name: string;
  description: string;
  mainImageIndex?: string; // Index da imagem principal (opcional, padrão: 0)
};

export type CreateProjectMultipartResponse = {
  id: string;
  name: string;
  status: ProjectStatus;
  createdAt: Date;
  images: {
    id: string;
    url: string;
    filename: string;
    isMain: boolean;
    size: number;
  }[];
};
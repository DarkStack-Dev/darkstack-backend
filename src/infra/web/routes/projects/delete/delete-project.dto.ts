// src/infra/web/routes/projects/delete/delete-project.dto.ts - ATUALIZADA

export type DeleteProjectResponse = {
  success: boolean;
  message: string;
  deletedAt: Date;
};

export type RestoreProjectResponse = {
  success: boolean;
  message: string;
  restoredAt: Date;
};
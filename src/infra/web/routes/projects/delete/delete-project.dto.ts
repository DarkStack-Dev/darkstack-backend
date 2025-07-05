// src/infra/web/routes/projects/delete/delete-project.dto.ts

export type DeleteProjectResponse = {
  success: boolean;
  message: string;
  deletedAt: Date;
};

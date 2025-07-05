// ===== PRESENTER =====

import { DeleteProjectResponse } from "./delete-project.dto";

// src/infra/web/routes/projects/delete/delete-project.presenter.ts

export class DeleteProjectPresenter {
  public static toHttp(deletedAt: Date): DeleteProjectResponse {
    return {
      success: true,
      message: 'Projeto deletado com sucesso',
      deletedAt,
    };
  }
}
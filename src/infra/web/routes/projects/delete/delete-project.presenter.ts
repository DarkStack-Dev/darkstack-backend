// src/infra/web/routes/projects/delete/delete-project.presenter.ts - ATUALIZADA

import { DeleteProjectOutput } from '@/domain/usecases/projects/delete/delete-project.usecase';
import { DeleteProjectResponse } from './delete-project.dto';

export class DeleteProjectPresenter {
  public static toHttp(output: DeleteProjectOutput): DeleteProjectResponse {
    return {
      success: output.success,
      message: output.message,
      deletedAt: output.deletedAt,
    };
  }
}
// ===== PRESENTER =====

// src/infra/web/routes/projects/create/create-project.presenter.ts

import { CreateProjectOutput } from '@/domain/usecases/projects/create/create-projects.usecase';
import { CreateProjectResponse } from './create-project.dto';

export class CreateProjectPresenter {
  public static toHttp(output: CreateProjectOutput): CreateProjectResponse {
    return {
      id: output.id,
      name: output.name,
      status: output.status,
      createdAt: output.createdAt,
      images: [], // Será populado pela rota com as URLs das imagens
    };
  }
}
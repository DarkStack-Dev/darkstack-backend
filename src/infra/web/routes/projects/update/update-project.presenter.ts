// src/infra/web/routes/projects/update/update-project.presenter.ts

import { UpdateProjectOutput } from '@/usecases/projects/update/update-project.usecase';
import { UpdateProjectResponse } from './update-project.dto';

export class UpdateProjectPresenter {
  public static toHttp(output: UpdateProjectOutput): UpdateProjectResponse {
    return {
      success: output.success,
      message: output.message,
      project: {
        id: output.project.id,
        name: output.project.name,
        description: output.project.description,
        status: output.project.status,
        updatedAt: output.project.updatedAt,
      },
      images: output.images.map(img => ({
        id: img.id,
        filename: img.filename,
        url: img.url,
        isMain: img.isMain,
        order: img.order,
      })),
      statusChanged: output.statusChanged,
    };
  }
}

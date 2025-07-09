// src/infra/web/routes/projects/approve/approve-project.presenter.ts

import { ApproveProjectOutput } from '@/usecases/projects/approve/approve-project.usecase';
import { ApproveProjectResponse } from './approve-project.dto';

export class ApproveProjectPresenter {
  public static toHttp(output: ApproveProjectOutput): ApproveProjectResponse {
    return {
      success: output.success,
      message: output.message,
      project: {
        id: output.project.id,
        name: output.project.name,
        status: output.project.status,
        ownerId: output.project.ownerId,
      },
      moderator: {
        id: output.moderator.id,
        name: output.moderator.name,
        email: output.moderator.email,
      },
      approvedAt: output.approvedAt,
      rejectionReason: output.rejectionReason,
      processedAt: output.processedAt,
    };
  }
}
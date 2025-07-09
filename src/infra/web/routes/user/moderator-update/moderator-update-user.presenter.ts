// src/infra/web/routes/user/moderator-update/moderator-update-user.presenter.ts

import { ModeratorUpdateUserOutput } from '@/usecases/user/moderator-update/moderator-update-user.usecase';
import { ModeratorUpdateUserResponse } from './moderator-update-user.dto';

export class ModeratorUpdateUserPresenter {
  public static toHttp(output: ModeratorUpdateUserOutput): ModeratorUpdateUserResponse {
    return {
      success: output.success,
      message: output.message,
      user: {
        id: output.user.id,
        name: output.user.name,
        email: output.user.email,
        isActive: output.user.isActive,
        emailVerified: output.user.emailVerified,
        updatedAt: output.user.updatedAt,
      },
      changedFields: output.changedFields,
      moderator: {
        id: output.moderator.id,
        name: output.moderator.name,
        email: output.moderator.email,
      },
      reason: output.reason,
    };
  }
}
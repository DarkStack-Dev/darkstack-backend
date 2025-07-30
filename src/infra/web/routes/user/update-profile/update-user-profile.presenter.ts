// src/infra/web/routes/user/update-profile/update-user-profile.presenter.ts

import { UpdateUserProfileOutput } from '@/usecases/user/update-profile/update-user-profile.usecase';
import { UpdateUserProfileResponse } from './update-user-profile.dto';

export class UpdateUserProfilePresenter {
  public static toHttp(output: UpdateUserProfileOutput): UpdateUserProfileResponse {
    return {
      success: output.success,
      message: output.message,
      user: {
        id: output.user.id,
        name: output.user.name,
        email: output.user.email,
        avatar: output.user.avatar,
        updatedAt: output.user.updatedAt,
      },
      changedFields: output.changedFields,
    };
  }
}

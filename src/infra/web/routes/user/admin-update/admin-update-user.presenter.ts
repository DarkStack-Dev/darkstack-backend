// src/infra/web/routes/user/admin-update/admin-update-user.presenter.ts

import { AdminUpdateUserOutput } from '@/usecases/user/admin-update/admin-update-user.usecase';
import { AdminUpdateUserResponse } from './admin-update-user.dto';

export class AdminUpdateUserPresenter {
  public static toHttp(output: AdminUpdateUserOutput): AdminUpdateUserResponse {
    return {
      success: output.success,
      message: output.message,
      user: {
        id: output.user.id,
        name: output.user.name,
        email: output.user.email,
        avatar: output.user.avatar,
        roles: output.user.roles,
        isActive: output.user.isActive,
        emailVerified: output.user.emailVerified,
        updatedAt: output.user.updatedAt,
      },
      changedFields: output.changedFields,
      admin: {
        id: output.admin.id,
        name: output.admin.name,
        email: output.admin.email,
      },
    };
  }
}
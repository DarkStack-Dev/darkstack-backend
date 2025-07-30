// src/infra/web/routes/user/list-users/list-users.presenter.ts

import { ListUsersOutput } from '@/usecases/user/list-users/list-users.usecase';
import { ListUsersResponse } from './list-users.dto';

export class ListUsersPresenter {
  public static toHttp(output: ListUsersOutput): ListUsersResponse {
    return {
      users: output.users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        avatar: user.avatar,
        projectCount: user.projectCount,
        lastLoginAt: user.lastLoginAt,
      })),
      pagination: output.pagination,
      stats: output.stats,
    };
  }
}
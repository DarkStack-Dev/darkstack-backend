// src/infra/web/routes/user/list-users/list-users.route.ts

import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { ListUsersQuery, ListUsersResponse } from './list-users.dto';
import { ListUsersPresenter } from './list-users.presenter';
import { Roles } from '@/infra/web/auth/decorators/roles.decorator';
import { ListUsersUsecase } from '@/usecases/user/list-users/list-users.usecase';
import { UserRole } from 'generated/prisma';

@Controller('/users')
export class ListUsersRoute {
  constructor(
    private readonly listUsersUsecase: ListUsersUsecase,
  ) {}

  /**
   * Listar todos os usuários (apenas moderadores/admins)
   * GET /users/all
   */
  @Get('/all')
  @Roles('ADMIN', 'MODERATOR')
  public async handle(
    @Query() query: ListUsersQuery,
    @Req() req: Request,
  ): Promise<ListUsersResponse> {
    const requesterId = req['userId'];
    const requesterRoles = req['user']?.roles || [];

    console.log(`👥 API: Listando usuários para moderador ${requesterId}`);

    // Processar roles da query (comma-separated)
    let rolesFilter: UserRole[] | undefined;
    if (query.roles) {
      rolesFilter = query.roles.split(',').map(role => role.trim() as UserRole);
    }

    const output = await this.listUsersUsecase.execute({
      requesterId,
      requesterRoles,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 20,
      search: query.search,
      roles: rolesFilter,
      isActive: query.isActive ? query.isActive === 'true' : undefined,
      emailVerified: query.emailVerified ? query.emailVerified === 'true' : undefined,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
    });

    console.log(`✅ API: Encontrados ${output.users.length} usuários de ${output.pagination.total} total`);

    return ListUsersPresenter.toHttp(output);
  }
}
// src/usecases/user/list-users/list-users.usecase.ts

import { Injectable } from '@nestjs/common';
import { UserRole } from 'generated/prisma';
import { ListUsersUseCase as DomainListUsersUseCase } from '@/domain/usecases/user/list-users/list-users.usecase';
import { UserNotFoundUsecaseException } from '@/usecases/exceptions/user/user-not-found.usecase.exception';
import { Usecase } from '@/usecases/usecase';

export type ListUsersInput = {
  requesterId: string;
  requesterRoles: UserRole[];
  page?: number;
  limit?: number;
  search?: string;
  roles?: UserRole[];
  isActive?: boolean;
  emailVerified?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'email';
  sortOrder?: 'asc' | 'desc';
};

export type UserSummaryOutput = {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
  projectCount?: number;
  lastLoginAt?: Date;
};

export type ListUsersOutput = {
  users: UserSummaryOutput[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  stats: {
    totalUsers: number;
    activeUsers: number;
    adminCount: number;
    moderatorCount: number;
    regularUsersCount: number;
  };
};

@Injectable()
export class ListUsersUsecase implements Usecase<ListUsersInput, ListUsersOutput> {
  public constructor(
    private readonly domainListUsersUseCase: DomainListUsersUseCase,
  ) {}

  public async execute(input: ListUsersInput): Promise<ListUsersOutput> {
    try {
      const result = await this.domainListUsersUseCase.execute(input);

      return {
        users: result.users.map(user => ({
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
        pagination: result.pagination,
        stats: result.stats,
      };
    } catch (error) {
      // Mapear exceptions do domínio para exceptions da aplicação
      if (error.name === 'UserNotFoundUsecaseException') {
        throw new UserNotFoundUsecaseException(
          error.internalMessage || `User not found with id ${input.requesterId} in ${ListUsersUsecase.name}`,
          error.externalMessage || 'Usuário não encontrado.',
          ListUsersUsecase.name,
        );
      }

      throw error;
    }
  }
}
// src/domain/usecases/user/list-users/list-users.usecase.ts

import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { UserGatewayRepository, UserSearchFilters } from '@/domain/repositories/user/user.gateway.repository';
import { UserNotFoundUsecaseException } from '../../exceptions/user/user-not-found.usecase.exception';
import { InvalidInputUsecaseException } from '../../exceptions/input/invalid-input.usecase.exception';
import { UserRole } from 'generated/prisma';

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
  projectCount?: number; // Quantidade de projetos
  lastLoginAt?: Date; // Se implementado
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
export class ListUsersUseCase implements UseCase<ListUsersInput, ListUsersOutput> {
  constructor(
    private readonly userRepository: UserGatewayRepository,
  ) {}

  public async execute({
    requesterId,
    requesterRoles,
    page = 1,
    limit = 20,
    search,
    roles,
    isActive,
    emailVerified,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  }: ListUsersInput): Promise<ListUsersOutput> {
    console.log(`👥 Listando usuários para moderador ${requesterId}`);

    // 1. Verificar permissões
    this.checkPermissions(requesterRoles);

    // 2. Verificar se solicitante existe
    const requester = await this.userRepository.findById(requesterId);
    if (!requester) {
      throw new UserNotFoundUsecaseException(
        `Requester not found with id ${requesterId} in ${ListUsersUseCase.name}`,
        'Usuário solicitante não encontrado',
        ListUsersUseCase.name,
      );
    }

    // 3. Validar parâmetros
    this.validateParameters(page, limit, sortBy, sortOrder);

    // 4. Preparar filtros
    const filters: UserSearchFilters = {
      search,
      roles,
      isActive,
      emailVerified,
      limit: Math.min(limit, 100), // Máximo 100 por página
      offset: (page - 1) * Math.min(limit, 100),
      sortBy,
      sortOrder,
    };

    try {
      // 5. Buscar usuários
      const result = await this.userRepository.findAll(filters);

      // 6. Buscar estatísticas
      const stats = await this.getUserStats();

      // 7. Processar dados dos usuários
      const processedUsers: UserSummaryOutput[] = result.users.map(user => ({
        id: user.getId(),
        name: user.getName(),
        email: user.getEmail(),
        roles: user.getRoles(),
        isActive: user.getIsActivate(),
        emailVerified: user.isEmailVerified(),
        createdAt: user.getCreatedAt(),
        updatedAt: user.getUpdatedAt(),
        avatar: user.getAvatar(),
        // TODO: Implementar contagem de projetos se necessário
        // projectCount: await this.getProjectCount(user.getId()),
      }));

      console.log(`✅ Encontrados ${processedUsers.length} usuários de ${result.total} total`);

      return {
        users: processedUsers,
        pagination: {
          page,
          limit: Math.min(limit, 100),
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.hasNext,
          hasPrevious: result.hasPrevious,
        },
        stats,
      };
    } catch (error) {
      console.error('❌ Erro ao listar usuários:', error);
      throw new InvalidInputUsecaseException(
        `Failed to list users: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Erro ao listar usuários',
        ListUsersUseCase.name,
      );
    }
  }

  private checkPermissions(requesterRoles: UserRole[]): void {
    const isAdmin = requesterRoles.includes(UserRole.ADMIN);
    const isModerator = requesterRoles.includes(UserRole.MODERATOR);

    if (!isAdmin && !isModerator) {
      throw new InvalidInputUsecaseException(
        'User attempted to list users without permission',
        'Apenas administradores e moderadores podem listar usuários',
        ListUsersUseCase.name,
      );
    }
  }

  private validateParameters(
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: string
  ): void {
    if (page < 1) {
      throw new InvalidInputUsecaseException(
        'Page must be greater than 0',
        'Página deve ser maior que 0',
        ListUsersUseCase.name,
      );
    }

    if (limit < 1 || limit > 100) {
      throw new InvalidInputUsecaseException(
        'Limit must be between 1 and 100',
        'Limite deve estar entre 1 e 100',
        ListUsersUseCase.name,
      );
    }

    const validSortFields = ['createdAt', 'updatedAt', 'name', 'email'];
    if (!validSortFields.includes(sortBy)) {
      throw new InvalidInputUsecaseException(
        `Invalid sortBy field: ${sortBy}`,
        'Campo de ordenação inválido',
        ListUsersUseCase.name,
      );
    }

    const validSortOrders = ['asc', 'desc'];
    if (!validSortOrders.includes(sortOrder)) {
      throw new InvalidInputUsecaseException(
        `Invalid sortOrder: ${sortOrder}`,
        'Ordem de classificação inválida',
        ListUsersUseCase.name,
      );
    }
  }

  private async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    adminCount: number;
    moderatorCount: number;
    regularUsersCount: number;
  }> {
    try {
      const [
        totalUsers,
        activeUsers,
        adminUsers,
        moderatorUsers,
      ] = await Promise.all([
        this.userRepository.count({}),
        this.userRepository.count({ isActive: true }),
        this.userRepository.findByRole(UserRole.ADMIN),
        this.userRepository.findByRole(UserRole.MODERATOR),
      ]);

      const regularUsersCount = totalUsers - adminUsers.length - moderatorUsers.length;

      return {
        totalUsers,
        activeUsers,
        adminCount: adminUsers.length,
        moderatorCount: moderatorUsers.length,
        regularUsersCount,
      };
    } catch (error) {
      // Se falhar, retornar estatísticas zeradas
      console.warn('⚠️ Erro ao buscar estatísticas de usuários:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        adminCount: 0,
        moderatorCount: 0,
        regularUsersCount: 0,
      };
    }
  }
}

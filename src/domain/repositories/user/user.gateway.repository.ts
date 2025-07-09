// src/domain/repositories/user/user.gateway.repository.ts - ATUALIZADO

import { User } from "@/domain/entities/user/user.entitty";
import { UserRole } from "generated/prisma";

export type UserSearchFilters = {
  search?: string; // Busca por nome ou email
  roles?: UserRole[];
  isActive?: boolean;
  emailVerified?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'email';
  sortOrder?: 'asc' | 'desc';
};

export type PaginatedUsersResult = {
  users: User[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export abstract class UserGatewayRepository {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract create(user: User): Promise<void>;
  
  // ✅ NOVOS MÉTODOS
  abstract findAll(filters?: UserSearchFilters): Promise<PaginatedUsersResult>;
  abstract update(user: User): Promise<void>;
  abstract softDelete(id: string): Promise<void>;
  abstract count(filters?: Partial<UserSearchFilters>): Promise<number>;
  abstract findByRole(role: UserRole): Promise<User[]>;
}
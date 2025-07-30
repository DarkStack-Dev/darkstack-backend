// src/infra/web/routes/user/list-users/list-users.dto.ts

import { UserRole } from "generated/prisma";

export type ListUsersQuery = {
  page?: string;
  limit?: string;
  search?: string;
  roles?: string; // Comma-separated roles
  isActive?: string; // 'true' | 'false'
  emailVerified?: string; // 'true' | 'false'
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'email';
  sortOrder?: 'asc' | 'desc';
};

export type ListUsersResponse = {
  users: {
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
  }[];
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
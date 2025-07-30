// src/infra/web/routes/user/admin-update/admin-update-user.dto.ts

import { UserRole } from "generated/prisma";

export type AdminUpdateUserRequest = {
  name?: string;
  email?: string;
  avatar?: string;
  roles?: UserRole[];
  isActive?: boolean;
  emailVerified?: boolean;
  newPassword?: string;
  forcePasswordChange?: boolean;
};

export type AdminUpdateUserResponse = {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    roles: UserRole[];
    isActive: boolean;
    emailVerified: boolean;
    updatedAt: Date;
  };
  changedFields: string[];
  admin: {
    id: string;
    name: string;
    email: string;
  };
};
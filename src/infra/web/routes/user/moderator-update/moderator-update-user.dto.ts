// src/infra/web/routes/user/moderator-update/moderator-update-user.dto.ts

export type ModeratorUpdateUserRequest = {
  isActive?: boolean;
  emailVerified?: boolean;
  reason?: string;
};

export type ModeratorUpdateUserResponse = {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    emailVerified: boolean;
    updatedAt: Date;
  };
  changedFields: string[];
  moderator: {
    id: string;
    name: string;
    email: string;
  };
  reason?: string;
};
// src/infra/web/routes/user/update-profile/update-user-profile.dto.ts

export type UpdateUserProfileRequest = {
  name?: string;
  email?: string;
  avatar?: string;
  currentPassword?: string;
  newPassword?: string;
};

export type UpdateUserProfileResponse = {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    updatedAt: Date;
  };
  changedFields: string[];
};
import { UserRole } from "generated/prisma";

export type MeUserRequest = {
  userId: string;
};

export type FindByIdUserResponse = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  roles: UserRole[];
  isActive: boolean;
};

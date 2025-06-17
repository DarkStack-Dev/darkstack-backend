import { UserRole } from "generated/prisma";

export type FindByIdUserResponse = {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  roles: UserRole[];
};

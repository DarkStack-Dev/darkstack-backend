import { UserRole } from "generated/prisma";

export type CreateUserRouteRequest = {
  name: string;
  email: string;
  password: string;
  roles: UserRole[];
};

export type CreateUserRouteResponse = {
  id: string;
};
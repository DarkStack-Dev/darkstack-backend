export type CreateUserRouteRequest = {
  name: string;
  email: string;
  password: string;
};

export type CreateUserRouteResponse = {
  id: string;
};
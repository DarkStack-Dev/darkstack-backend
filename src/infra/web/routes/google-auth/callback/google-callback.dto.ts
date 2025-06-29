// src/infra/web/routes/google-auth/callback/google-callback.dto.ts
export type GoogleCallbackRequest = {
  code: string;
  state?: string;
};

export type GoogleCallbackResponse = {
  authToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    roles: string[];
    isActive: boolean;
  };
  isNewUser: boolean;
};
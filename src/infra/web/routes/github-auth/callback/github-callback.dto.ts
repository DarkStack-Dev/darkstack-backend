// src/infra/web/routes/github-auth/callback/github-callback.dto.ts - CORRIGIDO

export type GitHubCallbackRequest = {
  code: string;
  state?: string;
};

export type GitHubCallbackResponse = {
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
// src/infra/web/routes/github-auth/start/start-github-auth.dto.ts
export type StartGitHubAuthRequest = {
  state?: string;
};

export type StartGitHubAuthResponse = {
  authorizationUrl: string;
};
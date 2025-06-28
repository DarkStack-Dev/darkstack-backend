// src/infra/services/github/types.ts
export type GitHubUserData = {
  id: number;
  login: string;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  email: string | null;
  name: string | null;
};

export type GitHubTokenResponse = {
  access_token: string;
  token_type: string;
  scope: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
};
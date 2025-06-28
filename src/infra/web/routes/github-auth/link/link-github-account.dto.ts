// src/infra/web/routes/github-auth/link/link-github-account.dto.ts
export type LinkGitHubAccountRequest = {
  code: string;
};

export type LinkGitHubAccountResponse = {
  success: boolean;
  githubAccount: {
    id: string;
    username: string;
    bio?: string;
  };
};
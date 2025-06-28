// src/infra/web/routes/github-auth/callback/github-callback.presenter.ts - CORRIGIDO

import { GitHubCallbackOutput } from '@/domain/usecases/github-auth/github-callback/github-callback.usecase';

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

export class GitHubCallbackPresenter {
  public static toHttp(output: GitHubCallbackOutput): GitHubCallbackResponse {
    return {
      authToken: output.authToken,
      refreshToken: output.refreshToken,
      user: {
        id: output.user.id,
        name: output.user.name,
        email: output.user.email,
        roles: output.user.roles, // Assuming roles is already string[]
        isActive: output.user.isActive,
      },
      isNewUser: output.isNewUser, // isNewUser está no nível raiz do output, não dentro de user
    };
  }
}
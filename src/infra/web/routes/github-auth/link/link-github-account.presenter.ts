// src/infra/web/routes/github-auth/link/link-github-account.presenter.ts
import { LinkGitHubAccountOutput } from '@/domain/usecases/github-auth/link-github-account/link-github-account.usecase';
import { LinkGitHubAccountResponse } from './link-github-account.dto';

export class LinkGitHubAccountPresenter {
  public static toHttp(output: LinkGitHubAccountOutput): LinkGitHubAccountResponse {
    return {
      success: output.success,
      githubAccount: {
        id: output.githubAccount.id,
        username: output.githubAccount.username,
        bio: output.githubAccount.bio,
      },
    };
  }
}
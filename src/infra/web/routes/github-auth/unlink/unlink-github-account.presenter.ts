// src/infra/web/routes/github-auth/unlink/unlink-github-account.presenter.ts
import { UnlinkGitHubAccountOutput } from '@/domain/usecases/github-auth/unlink-github-account/unlink-github-account.usecase';
import { UnlinkGitHubAccountResponse } from './unlink-github-account.dto';

export class UnlinkGitHubAccountPresenter {
  public static toHttp(output: UnlinkGitHubAccountOutput): UnlinkGitHubAccountResponse {
    return {
      success: output.success,
    };
  }
}
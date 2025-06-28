// src/infra/web/routes/github-auth/start/start-github-auth.presenter.ts
import { StartGitHubAuthOutput } from '@/domain/usecases/github-auth/start-github-auth/start-github-auth.usecase';
import { StartGitHubAuthResponse } from './start-github-auth.dto';

export class StartGitHubAuthPresenter {
  public static toHttp(output: StartGitHubAuthOutput): StartGitHubAuthResponse {
    return {
      authorizationUrl: output.authorizationUrl,
    };
  }
}
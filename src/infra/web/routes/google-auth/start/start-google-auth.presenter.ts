// src/infra/web/routes/google-auth/start/start-google-auth.presenter.ts
import { StartGoogleAuthOutput } from '@/domain/usecases/google-auth/start-google-auth/start-google-auth.usecase';
import { StartGoogleAuthResponse } from './start-google-auth.dto';

export class StartGoogleAuthPresenter {
  public static toHttp(output: StartGoogleAuthOutput): StartGoogleAuthResponse {
    return {
      authorizationUrl: output.authorizationUrl,
    };
  }
}

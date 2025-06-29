// src/infra/web/routes/google-auth/callback/google-callback.presenter.ts
import { GoogleCallbackOutput } from '@/domain/usecases/google-auth/google-callback/google-callback.usecase';

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

export class GoogleCallbackPresenter {
  public static toHttp(output: GoogleCallbackOutput): GoogleCallbackResponse {
    return {
      authToken: output.authToken,
      refreshToken: output.refreshToken,
      user: {
        id: output.user.id,
        name: output.user.name,
        email: output.user.email,
        roles: output.user.roles,
        isActive: output.user.isActive,
      },
      isNewUser: output.isNewUser,
    };
  }
}
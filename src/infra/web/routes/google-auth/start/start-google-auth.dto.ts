// src/infra/web/routes/google-auth/start/start-google-auth.dto.ts
export type StartGoogleAuthRequest = {
  state?: string;
};

export type StartGoogleAuthResponse = {
  authorizationUrl: string;
};
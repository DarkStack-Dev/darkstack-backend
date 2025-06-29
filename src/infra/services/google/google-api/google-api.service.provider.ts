// src/infra/services/google/google-api/google-api.service.provider.ts

import { GoogleApiService } from './google-api.service';

export const googleApiServiceProvider = {
  provide: GoogleApiService,
  useClass: GoogleApiService,
};
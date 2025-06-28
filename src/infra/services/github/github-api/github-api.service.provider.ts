
// src/infra/services/github/github-api/github-api.service.provider.ts

import { GitHubApiService } from './github-api.service';

export const githubApiServiceProvider = {
  provide: GitHubApiService,
  useClass: GitHubApiService,
};

// src/infra/services/github/github-api/github-api.service.provider.ts - CORRIGIDO

import { GitHubService } from '../github.service';
import { GitHubApiService } from './github-api.service';

export const githubServiceProvider = {
  provide: GitHubService,
  useClass: GitHubApiService,
};
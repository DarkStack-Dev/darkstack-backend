// src/infra/repositories/prisma/github-account/github-account.prisma.repository.provider.ts

import { GitHubAccountGatewayRepository } from '@/domain/repositories/github-account/github-account.gateway.repository';
import { GitHubAccountPrismaRepository } from './github-account.prisma.repository';

export const githubAccountPrismaRepositoryProvider = {
  provide: GitHubAccountGatewayRepository,
  useClass: GitHubAccountPrismaRepository,
};
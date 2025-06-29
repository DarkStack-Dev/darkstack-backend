// src/infra/repositories/prisma/google-account/google-account.prisma.repository.provider.ts

import { GoogleAccountGatewayRepository } from '@/domain/repositories/google-account/google-account.gateway.repository';
import { GoogleAccountPrismaRepository } from './google-account.prisma.repository';

export const googleAccountPrismaRepositoryProvider = {
  provide: GoogleAccountGatewayRepository,
  useClass: GoogleAccountPrismaRepository,
};
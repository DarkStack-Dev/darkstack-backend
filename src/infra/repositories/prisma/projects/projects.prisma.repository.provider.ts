// src/infra/repositories/prisma/projects/projects.prisma.repository.provider.ts

import { ProjectsGatewayRepository } from '@/domain/repositories/projects/projects.gateway.repository';
import { ProjectsPrismaRepository } from './projects.prisma.repository';

export const projectsPrismaRepositoryProvider = {
  provide: ProjectsGatewayRepository,
  useClass: ProjectsPrismaRepository,
};
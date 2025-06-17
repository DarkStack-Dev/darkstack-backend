import { UserGatewayRepository } from 'src/domain/repositories/user/user.gateway.repository';
import { UserPrismaRepository } from './user.prisma.repository';

export const userPrismaRepositoryProvider = {
  provide: UserGatewayRepository,
  useClass: UserPrismaRepository,
};
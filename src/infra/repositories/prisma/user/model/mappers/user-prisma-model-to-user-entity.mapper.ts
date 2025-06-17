import { User } from 'src/domain/entities/user.entitty';
import UserPrismaModel from '../user.prisma.model';

export class UserPrismaModelToUserEntityMapper {
  public static map(user: UserPrismaModel): User {
    const anUser = User.with({
      id: user.id,
      name: user.name,
      email: user.email,      
      password: user.password,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

    return anUser;
  }
}
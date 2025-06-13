import { User } from 'src/domain/entities/user.entitty';
import UserPrismaModel from '../user.prisma.model';

export class UserEntityToUserPrismaModelMapper {
  public static map(user: User): UserPrismaModel {
    const aModel: UserPrismaModel = {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail(),
      password: user.getPassword(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt(),
    };

    return aModel;
  }
}
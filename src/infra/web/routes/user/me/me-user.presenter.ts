import { FindUserOutput } from 'src/usecases/user/find-by-id/find-user.usecase';
import { FindByIdUserResponse } from './me-user.dto';

export class FindByIdUserPresenter {
  public static toHttp(input: FindUserOutput): FindByIdUserResponse {
    const response: FindByIdUserResponse = {
      id: input.id,
      name: input.name,
      email: input.email,
      roles: input.roles,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
      isActive: input.isActive
    };

    return response;
  }
}
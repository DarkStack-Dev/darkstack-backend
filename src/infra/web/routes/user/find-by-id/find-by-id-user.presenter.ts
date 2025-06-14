import { FindUserOutput } from 'src/usecases/user/find-by-id/find-user.usecase';
import { FindByIdUserResponse } from './find-by-id-user.dto';

export class FindByIdUserPresenter {
  public static toHttp(input: FindUserOutput): FindByIdUserResponse {
    const response: FindByIdUserResponse = {
      id: input.id,
      email: input.email,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    };

    return response;
  }
}
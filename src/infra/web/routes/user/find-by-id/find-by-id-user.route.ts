import { Controller, Get, Param } from '@nestjs/common';
import {
  FindUserInput,
  FindUserUsecase,
} from 'src/usecases/user/find-by-id/find-user.usecase';
import { FindByIdUserResponse } from './find-by-id-user.dto';
import { FindByIdUserPresenter } from './find-by-id-user.presenter';

@Controller('/users')
export class FindByIdUserRoute {
  public constructor(private readonly findUserUsecase: FindUserUsecase) {}

  @Get(':id')
  public async handle(
    @Param('id') userId: string,
  ): Promise<FindByIdUserResponse> {
    const input: FindUserInput = {
      id: userId,
    };

    const output = await this.findUserUsecase.execute(input);

    const response = FindByIdUserPresenter.toHttp(output);

    return response;
  }
}
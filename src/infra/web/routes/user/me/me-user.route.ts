import { Body, CanActivate, Controller, Get, Param, Req } from '@nestjs/common';
import {
  FindUserInput,
  FindUserUsecase,
} from 'src/usecases/user/find-by-id/find-user.usecase';
import { Roles } from 'src/infra/web/auth/decorators/roles.decorator';
import { FindByIdUserResponse, MeUserRequest } from './me-user.dto';
import { FindByIdUserPresenter } from './me-user.presenter';
import { Request } from 'express';

@Controller('/users')
export class MeUserRoute  {
  public constructor(private readonly findUserUsecase: FindUserUsecase) {}

  @Get('')
  public async handle(@Req() request: Request): Promise<FindByIdUserResponse> {
    const input: FindUserInput = {
      id: request['userId'], // Assuming the userId is passed in the request body
    };
    
    const output = await this.findUserUsecase.execute(input);

    const response = FindByIdUserPresenter.toHttp(output);

    return response;
  }
}
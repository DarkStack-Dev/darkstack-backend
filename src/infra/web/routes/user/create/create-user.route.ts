import { Body, Controller, Post } from '@nestjs/common';
import {
  CreateUserInput,
  CreateUserUsecase,
} from 'src/usecases/user/create/create-user.usecase';
import {
  CreateUserRouteRequest,
  CreateUserRouteResponse,
} from './create-user.dto';
import { CreateUserPresenter } from './create-user.presenter';
import { IsPublic } from 'src/infra/web/auth/decorators/is-public.decorator';

@Controller('/users')
export class CreateUserRoute {
  public constructor(private readonly createUserUsecase: CreateUserUsecase) {}

  @IsPublic()
  @Post("/signup")
  public async handle(
    @Body() request: CreateUserRouteRequest,
  ): Promise<CreateUserRouteResponse> {
    const input: CreateUserInput = {
      name: request.name,
      email: request.email,
      password: request.password,
      roles: request.roles  || ['USER'],
    };

    const result = await this.createUserUsecase.execute(input);

    const response = CreateUserPresenter.toHttp(result);

    return response;
  }
}
// src/infra/web/routes/google-auth/start/start-google-auth.route.ts
import { Controller, Post, Body } from '@nestjs/common';
import { IsPublic } from '@/infra/web/auth/decorators/is-public.decorator';
import { StartGoogleAuthUseCase } from '@/domain/usecases/google-auth/start-google-auth/start-google-auth.usecase';
import { StartGoogleAuthRequest, StartGoogleAuthResponse } from './start-google-auth.dto';
import { StartGoogleAuthPresenter } from './start-google-auth.presenter';

@Controller('/auth/google')
export class StartGoogleAuthRoute {
  constructor(private readonly startGoogleAuthUseCase: StartGoogleAuthUseCase) {}

  @IsPublic()
  @Post('/start')
  public async handle(@Body() request: StartGoogleAuthRequest): Promise<StartGoogleAuthResponse> {
    const output = await this.startGoogleAuthUseCase.execute({
      state: request.state,
    });

    return StartGoogleAuthPresenter.toHttp(output);
  }
}
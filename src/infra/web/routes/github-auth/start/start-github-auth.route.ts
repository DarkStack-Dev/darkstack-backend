// src/infra/web/routes/github-auth/start/start-github-auth.route.ts
import { Controller, Post, Body } from '@nestjs/common';
import { IsPublic } from '@/infra/web/auth/decorators/is-public.decorator';
import { StartGitHubAuthUseCase } from '@/domain/usecases/github-auth/start-github-auth/start-github-auth.usecase';
import { StartGitHubAuthRequest, StartGitHubAuthResponse } from './start-github-auth.dto';
import { StartGitHubAuthPresenter } from './start-github-auth.presenter';

@Controller('/auth/github')
export class StartGitHubAuthRoute {
  constructor(private readonly startGitHubAuthUseCase: StartGitHubAuthUseCase) {}

  @IsPublic()
  @Post('/start')
  public async handle(@Body() request: StartGitHubAuthRequest): Promise<StartGitHubAuthResponse> {
    const output = await this.startGitHubAuthUseCase.execute({
      state: request.state,
    });

    return StartGitHubAuthPresenter.toHttp(output);
  }
}
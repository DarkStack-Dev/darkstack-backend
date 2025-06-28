// src/infra/web/routes/github-auth/link/link-github-account.route.ts
import { Controller, Post, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { LinkGitHubAccountUseCase } from '@/domain/usecases/github-auth/link-github-account/link-github-account.usecase';
import { LinkGitHubAccountRequest, LinkGitHubAccountResponse } from './link-github-account.dto';
import { LinkGitHubAccountPresenter } from './link-github-account.presenter';

@Controller('/auth/github')
export class LinkGitHubAccountRoute {
  constructor(private readonly linkGitHubAccountUseCase: LinkGitHubAccountUseCase) {}

  @Post('/link')
  public async handle(
    @Body() request: LinkGitHubAccountRequest,
    @Req() req: Request,
  ): Promise<LinkGitHubAccountResponse> {
    const userId = req['userId']; // Vem do AuthGuard

    const output = await this.linkGitHubAccountUseCase.execute({
      userId,
      code: request.code,
    });

    return LinkGitHubAccountPresenter.toHttp(output);
  }
}
// src/infra/web/routes/github-auth/unlink/unlink-github-account.route.ts
import { Controller, Delete, Req } from '@nestjs/common';
import { Request } from 'express';
import { UnlinkGitHubAccountUseCase } from '@/domain/usecases/github-auth/unlink-github-account/unlink-github-account.usecase';
import { UnlinkGitHubAccountResponse } from './unlink-github-account.dto';
import { UnlinkGitHubAccountPresenter } from './unlink-github-account.presenter';

@Controller('/auth/github')
export class UnlinkGitHubAccountRoute {
  constructor(private readonly unlinkGitHubAccountUseCase: UnlinkGitHubAccountUseCase) {}

  @Delete('/unlink')
  public async handle(@Req() req: Request): Promise<UnlinkGitHubAccountResponse> {
    const userId = req['userId']; // Vem do AuthGuard

    const output = await this.unlinkGitHubAccountUseCase.execute({
      userId,
    });

    return UnlinkGitHubAccountPresenter.toHttp(output);
  }
}
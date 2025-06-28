// src/domain/usecases/github-auth/start-github-auth/start-github-auth.usecase.ts
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { GitHubService } from '@/infra/services/github/github.service';

export type StartGitHubAuthInput = {
  state?: string;
}

export type StartGitHubAuthOutput = {
  authorizationUrl: string;
}

@Injectable()
export class StartGitHubAuthUseCase implements UseCase<StartGitHubAuthInput, StartGitHubAuthOutput> {
  constructor(private readonly githubService: GitHubService) {}

  public async execute({ state }: StartGitHubAuthInput): Promise<StartGitHubAuthOutput> {
    const authorizationUrl = this.githubService.getAuthorizationUrl(state);

    return {
      authorizationUrl,
    };
  }
}
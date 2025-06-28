// src/infra/services/github/github.service.ts
import { Injectable } from '@nestjs/common';
import { GitHubUserData, GitHubTokenResponse } from './types';
import { ServiceException } from '../exceptions/service.exception';

export abstract class GitHubService {
  abstract exchangeCodeForToken(code: string): Promise<GitHubTokenResponse>;
  abstract getUserData(accessToken: string): Promise<GitHubUserData>;
  abstract getAuthorizationUrl(state?: string): string;
}

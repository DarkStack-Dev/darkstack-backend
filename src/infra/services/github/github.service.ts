// src/infra/services/github/github.service.ts - ATUALIZADO
import { Injectable } from '@nestjs/common';
import { GitHubUserData, GitHubTokenResponse } from './types';

export type GitHubEmailData = {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
};

export abstract class GitHubService {
  abstract exchangeCodeForToken(code: string): Promise<GitHubTokenResponse>;
  abstract getUserData(accessToken: string): Promise<GitHubUserData>;
  abstract getUserEmails(accessToken: string): Promise<GitHubEmailData[]>;
  abstract getAuthorizationUrl(state?: string): string;
}
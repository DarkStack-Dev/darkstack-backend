// src/domain/factories/github-account/github-account.validator.factory.ts
import { GitHubAccount } from "@/domain/entities/github-account/github-account.entity";
import { Validator } from "@/domain/shared/validators/validator";
import { GitHubAccountZodValidator } from "@/domain/validators/github-account/github-account.zod.validator";

export class GitHubAccountValidatorFactory {
  public static create(): Validator<GitHubAccount> {
    return GitHubAccountZodValidator.create();
  }
}


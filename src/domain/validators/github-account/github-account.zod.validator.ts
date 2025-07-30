// src/domain/validators/github-account/github-account.zod.validator.ts - Corrigido para UUID
import { z } from "zod";
import { Validator } from "@/domain/shared/validators/validator";
import { ZodUtils } from "@/shared/utils/zod-utils";
import { ValidatorDomainException } from "@/domain/shared/exceptions/validator-domain.exception";
import { DomainException } from "@/domain/shared/exceptions/domain.exception";
import { GitHubAccount } from "@/domain/entities/github-account/github-account.entity";

export class GitHubAccountZodValidator implements Validator<GitHubAccount> {
  private constructor() {}

  public static create(): GitHubAccountZodValidator {
    return new GitHubAccountZodValidator();
  }

  public validate(input: GitHubAccount): void {
    try {
      this.getZodSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = ZodUtils.formatZodError(error);
        throw new ValidatorDomainException(
          `Error while validating GitHubAccount ${input.getId()}: ${message}`,
          `Os dados informados não são válidos para a conta GitHub ${input.getId()}: ${message}`,
          GitHubAccountZodValidator.name
        );
      } else {
        const err = error as Error;

        throw new DomainException(
          `Error while validating GitHubAccount ${input.getId()}: ${err.message}`,
          `Erro inesperado para validar os dados da conta GitHub ${input.getId()}: ${err.message}`,
          GitHubAccountZodValidator.name
        );
      }
    }
  }

  private getZodSchema() {
    const zodSchema = z.object({
      id: z.string().uuid("Invalid GitHub account ID format"), // ✅ Mudou de .uuid() para .uuid() (já estava correto)
      userId: z.string().uuid("Invalid user ID format"), // ✅ Mudou de .uuid() para .uuid() (já estava correto)
      githubId: z.string().min(1, "GitHub ID is required"),
      username: z.string().min(1, "Username is required"),
      bio: z.string().optional(),
      publicRepos: z.number().min(0, "Public repos must be non-negative"),
      followers: z.number().min(0, "Followers must be non-negative"),
      following: z.number().min(0, "Following must be non-negative"),
      githubAccessToken: z.string().optional(),
      githubRefreshToken: z.string().optional(),
      tokenExpiresAt: z.date().optional(),
      lastSyncAt: z.date(),
      createdAt: z.date(),
      updatedAt: z.date(),
      isActive: z.boolean(),
    });

    return zodSchema;
  }
}
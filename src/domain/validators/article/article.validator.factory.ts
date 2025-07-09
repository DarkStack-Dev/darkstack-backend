// src/domain/factories/article/article.validator.factory.ts
import { Validator } from "@/domain/shared/validators/validator";
import { ArticleZodValidator } from "@/domain/validators/article/article.zod.validator";
import { Article } from "@/domain/entities/article/article.entity";

export class ArticleValidatorFactory {
  public static create(): Validator<Article> {
    return ArticleZodValidator.create();
  }
}
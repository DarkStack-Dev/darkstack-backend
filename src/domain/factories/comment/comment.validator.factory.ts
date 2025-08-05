// src/domain/factories/comment/comment.validator.factory.ts
import { CommentZodValidator } from '@/domain/validators/comment/comment.zod.validator';

export class CommentValidatorFactory {
  public static create(): CommentZodValidator {
    return new CommentZodValidator();
  }
}
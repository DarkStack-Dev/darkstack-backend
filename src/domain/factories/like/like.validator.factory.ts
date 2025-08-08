// src/domain/factories/like/like.validator.factory.ts
import { LikeZodValidator } from '@/domain/validators/like/like.zod.validator';

export class LikeValidatorFactory {
  public static create(): LikeZodValidator {
    return new LikeZodValidator();
  }
}
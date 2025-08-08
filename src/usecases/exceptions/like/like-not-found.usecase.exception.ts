// src/usecases/exceptions/like/like-not-found.usecase.exception.ts
import { UsecaseException } from '../usecase.exception';

export class LikeNotFoundUsecaseException extends UsecaseException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ) {
    super(internalMessage, externalMessage, context);
    this.name = LikeNotFoundUsecaseException.name;
  }
}

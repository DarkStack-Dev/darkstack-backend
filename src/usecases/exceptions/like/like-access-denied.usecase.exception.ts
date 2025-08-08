// src/usecases/exceptions/like/like-access-denied.usecase.exception.ts
import { UsecaseException } from '../usecase.exception';

export class LikeAccessDeniedUsecaseException extends UsecaseException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ) {
    super(internalMessage, externalMessage, context);
    this.name = LikeAccessDeniedUsecaseException.name;
  }
}
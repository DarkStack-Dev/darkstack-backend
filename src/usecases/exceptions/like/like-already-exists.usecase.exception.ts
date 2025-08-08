// src/usecases/exceptions/like/like-already-exists.usecase.exception.ts
import { UsecaseException } from '../usecase.exception';

export class LikeAlreadyExistsUsecaseException extends UsecaseException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ) {
    super(internalMessage, externalMessage, context);
    this.name = LikeAlreadyExistsUsecaseException.name;
  }
}
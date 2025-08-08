// src/usecases/exceptions/like/target-not-found.usecase.exception.ts
import { UsecaseException } from '../usecase.exception';

export class TargetNotFoundUsecaseException extends UsecaseException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ) {
    super(internalMessage, externalMessage, context);
    this.name = TargetNotFoundUsecaseException.name;
  }
}
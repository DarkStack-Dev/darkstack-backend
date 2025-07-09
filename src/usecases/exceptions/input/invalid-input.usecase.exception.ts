// src/usecases/exceptions/input/invalid-input.usecase.exception.ts (se não existir)
import { UsecaseException } from '../usecase.exception';

export class InvalidInputUsecaseException extends UsecaseException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ) {
    super(internalMessage, externalMessage, context);
    this.name = InvalidInputUsecaseException.name;
  }
}
// src/usecases/exceptions/input/invalid-input.usecase.exception.ts (se não existir)
import { UsecaseException } from '../usecase.exception';
import { HttpStatus } from '@nestjs/common';

export class InvalidInputUsecaseException extends UsecaseException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST
  ) {
    super(internalMessage, externalMessage, context, statusCode);
    this.name = InvalidInputUsecaseException.name;
  }
}
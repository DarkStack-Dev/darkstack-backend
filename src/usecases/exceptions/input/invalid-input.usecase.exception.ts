// src/usecases/exceptions/input/invalid-input.usecase.exception.ts
import { HttpStatus } from '@nestjs/common';
import { UsecaseException } from '../usecase.exception';

export class InvalidInputUsecaseException extends UsecaseException {
  constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ) {
    super(internalMessage, externalMessage, context, HttpStatus.BAD_REQUEST);
  }
}
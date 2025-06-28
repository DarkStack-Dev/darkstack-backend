import { HttpStatus } from '@nestjs/common';
import { UsecaseException } from './usecase.exception';

export class EmailAlreadyExistsUsecaseException extends UsecaseException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
    statusCode: HttpStatus = HttpStatus.CONFLICT
  ) {
    super(internalMessage, externalMessage, context, statusCode);
    this.name = EmailAlreadyExistsUsecaseException.name;
  }
}
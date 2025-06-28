import { HttpStatus } from '@nestjs/common';
import { Exception } from 'src/shared/exceptions/exception';

export class UsecaseException extends Exception {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR // Tornar opcional
  ) {
    super(internalMessage, externalMessage, context, statusCode);
    this.name = UsecaseException.name;
  }
}
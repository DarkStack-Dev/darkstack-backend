import { UseCaseException } from "../usecase.exception"; // Assuming usecase.exception is in the parent directory
import { HttpStatus } from '@nestjs/common';

export class InvalidInputUsecaseException extends UseCaseException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST
  ) {
    super(internalMessage, externalMessage, context, statusCode);
    this.name = "InvalidInputUsecaseException";
  }
}
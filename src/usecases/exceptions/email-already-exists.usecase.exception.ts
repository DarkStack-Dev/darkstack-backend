import { UsecaseException } from './usecase.exception';

export class EmailAlreadyExistsUsecaseException extends UsecaseException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ) {
    super(internalMessage, externalMessage, context);
    this.name = EmailAlreadyExistsUsecaseException.name;
  }
}
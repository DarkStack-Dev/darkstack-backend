import { UseCaseException } from '../usecase.exception';

export class UnauthorizedUsecaseException extends UseCaseException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ){
    super(internalMessage, externalMessage, context);
    this.name = UnauthorizedUsecaseException.name;
  }
}
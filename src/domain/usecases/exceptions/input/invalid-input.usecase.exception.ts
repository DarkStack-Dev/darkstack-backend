import { UseCaseException } from "../usecase.exception"; // Assuming usecase.exception is in the parent directory

export class InvalidInputUsecaseException extends UseCaseException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ) {
    super(internalMessage, externalMessage, context);
    this.name = "InvalidInputUsecaseException";
  }
}
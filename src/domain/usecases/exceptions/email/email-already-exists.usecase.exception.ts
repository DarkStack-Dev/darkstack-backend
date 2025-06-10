import { UseCaseException } from "../usecase.exception";

export class EmailAlreadyExistsUsecaseException extends UseCaseException{
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ){
    super(internalMessage, externalMessage, context);
    this.name = "EmailAlreadyExistsUsecaseException";
  }
}
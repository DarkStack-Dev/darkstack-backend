

import { UseCaseException } from "../usecase.exception";

export class CredentialsNotValidUsecaseException extends UseCaseException{
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ){
    super(internalMessage, externalMessage, context);
    this.name = CredentialsNotValidUsecaseException.name;
  }
}
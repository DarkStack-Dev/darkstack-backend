import { Exception } from "src/shared/exceptions/exception";

export class UseCaseException extends Exception{
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ){
    super(internalMessage, externalMessage, context);
    this.name = "UseCaseException";
  }
}
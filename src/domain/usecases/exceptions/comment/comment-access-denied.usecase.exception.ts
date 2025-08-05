// src/domain/usecases/exceptions/comment/comment-access-denied.usecase.exception.ts
import { UseCaseException } from '../usecase.exception';

export class CommentAccessDeniedUsecaseException extends UseCaseException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ){
    super(internalMessage, externalMessage, context);
    this.name = CommentAccessDeniedUsecaseException.name;
  }
}
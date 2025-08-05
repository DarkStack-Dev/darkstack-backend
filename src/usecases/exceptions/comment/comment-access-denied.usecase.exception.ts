// src/usecases/exceptions/comment/comment-access-denied.usecase.exception.ts
import { UsecaseException } from '../usecase.exception';

export class CommentAccessDeniedUsecaseException extends UsecaseException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ) {
    super(internalMessage, externalMessage, context);
    this.name = CommentAccessDeniedUsecaseException.name;
  }
}
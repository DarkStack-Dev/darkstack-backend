// src/usecases/exceptions/comment/comment-limit-reached.usecase.exception.ts
import { UsecaseException } from '../usecase.exception';

export class CommentLimitReachedUsecaseException extends UsecaseException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ) {
    super(internalMessage, externalMessage, context);
    this.name = CommentLimitReachedUsecaseException.name;
  }
}
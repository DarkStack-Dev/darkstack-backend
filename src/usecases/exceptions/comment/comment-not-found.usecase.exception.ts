// src/usecases/exceptions/comment/comment-not-found.usecase.exception.ts
import { UsecaseException } from '../usecase.exception';

export class CommentNotFoundUsecaseException extends UsecaseException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ) {
    super(internalMessage, externalMessage, context);
    this.name = CommentNotFoundUsecaseException.name;
  }
}
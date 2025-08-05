// src/domain/usecases/exceptions/comment/comment-limit-reached.usecase.exception.ts
import { UseCaseException } from '../usecase.exception';

export class CommentLimitReachedUsecaseException extends UseCaseException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ){
    super(internalMessage, externalMessage, context);
    this.name = CommentLimitReachedUsecaseException.name;
  }
}
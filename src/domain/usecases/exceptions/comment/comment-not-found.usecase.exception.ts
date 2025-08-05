// src/domain/usecases/exceptions/comment/comment-not-found.usecase.exception.ts
import { UseCaseException } from '../usecase.exception';

export class CommentNotFoundUsecaseException extends UseCaseException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ){
    super(internalMessage, externalMessage, context);
    this.name = CommentNotFoundUsecaseException.name;
  }
}
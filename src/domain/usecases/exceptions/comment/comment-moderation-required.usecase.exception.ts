// src/domain/usecases/exceptions/comment/comment-moderation-required.usecase.exception.ts
import { UseCaseException } from '../usecase.exception';

export class CommentModerationRequiredUsecaseException extends UseCaseException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ){
    super(internalMessage, externalMessage, context);
    this.name = CommentModerationRequiredUsecaseException.name;
  }
}
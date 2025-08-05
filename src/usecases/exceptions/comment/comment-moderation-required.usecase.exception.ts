// src/usecases/exceptions/comment/comment-moderation-required.usecase.exception.ts
import { UsecaseException } from '../usecase.exception';

export class CommentModerationRequiredUsecaseException extends UsecaseException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ) {
    super(internalMessage, externalMessage, context);
    this.name = CommentModerationRequiredUsecaseException.name;
  }
}
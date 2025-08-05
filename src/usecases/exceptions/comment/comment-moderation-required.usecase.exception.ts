// src/usecases/exceptions/comment/comment-moderation-required.usecase.exception.ts
import { HttpStatus } from '@nestjs/common';
import { UsecaseException } from '../usecase.exception';

export class CommentModerationRequiredUsecaseException extends UsecaseException {
  constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ) {
    super(internalMessage, externalMessage, context, HttpStatus.ACCEPTED);
  }
}
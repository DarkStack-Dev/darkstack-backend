// src/usecases/exceptions/comment/comment-limit-reached.usecase.exception.ts
import { HttpStatus } from '@nestjs/common';
import { UsecaseException } from '../usecase.exception';

export class CommentLimitReachedUsecaseException extends UsecaseException {
  constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ) {
    super(internalMessage, externalMessage, context, HttpStatus.TOO_MANY_REQUESTS);
  }
}
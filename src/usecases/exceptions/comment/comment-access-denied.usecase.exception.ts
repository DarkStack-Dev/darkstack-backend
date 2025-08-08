// src/usecases/exceptions/comment/comment-not-found.usecase.exception.ts
import { HttpStatus } from '@nestjs/common';
import { UsecaseException } from '../usecase.exception';

export class CommentAccessDeniedUsecaseException  extends UsecaseException {
  constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ) {
    super(internalMessage, externalMessage, context, HttpStatus.NOT_FOUND);
  }
}
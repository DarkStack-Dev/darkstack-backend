// src/infra/web/filters/usecases/comment/comment-not-found-usecase-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Response } from 'express';
import { CommentNotFoundUsecaseException } from '@/usecases/exceptions/comment/comment-not-found.usecase.exception';
import { ExceptionUtils } from '@/shared/utils/exception-utils';
import { LogUtils } from '@/shared/utils/log-utils';

@Catch(CommentNotFoundUsecaseException)
export class CommentNotFoundUsecaseExceptionFilter implements ExceptionFilter {
  public catch(exception: CommentNotFoundUsecaseException, host: ArgumentsHost) {
    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.NOT_FOUND;

    const responseData = ExceptionUtils.buildErrorResponse(exception, status);
    response.status(status).json(responseData);
  }
}

export const CommentNotFoundUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: CommentNotFoundUsecaseExceptionFilter,
};
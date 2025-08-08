// src/infra/web/filters/usecases/comment/comment-limit-reached-usecase-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Response } from 'express';
import { CommentLimitReachedUsecaseException } from '@/usecases/exceptions/comment/comment-limit-reached.usecase.exception';
import { ExceptionUtils } from '@/shared/utils/exception-utils';
import { LogUtils } from '@/shared/utils/log-utils';

@Catch(CommentLimitReachedUsecaseException)
export class CommentLimitReachedUsecaseExceptionFilter implements ExceptionFilter {
  public catch(exception: CommentLimitReachedUsecaseException, host: ArgumentsHost) {
    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.TOO_MANY_REQUESTS;

    const responseData = ExceptionUtils.buildErrorResponse(exception, status);
    response.status(status).json(responseData);
  }
}

export const CommentLimitReachedUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: CommentLimitReachedUsecaseExceptionFilter,
};
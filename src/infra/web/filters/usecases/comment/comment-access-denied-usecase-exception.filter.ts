// src/infra/web/filters/usecases/comment/comment-access-denied-usecase-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Response } from 'express';
import { CommentAccessDeniedUsecaseException } from '@/usecases/exceptions/comment/comment-access-denied.usecase.exception';
import { ExceptionUtils } from '@/shared/utils/exception-utils';
import { LogUtils } from '@/shared/utils/log-utils';

@Catch(CommentAccessDeniedUsecaseException)
export class CommentAccessDeniedUsecaseExceptionFilter implements ExceptionFilter {
  public catch(exception: CommentAccessDeniedUsecaseException, host: ArgumentsHost) {
    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.FORBIDDEN;

    const responseData = ExceptionUtils.buildErrorResponse(exception, status);
    response.status(status).json(responseData);
  }
}

export const CommentAccessDeniedUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: CommentAccessDeniedUsecaseExceptionFilter,
};

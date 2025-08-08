// src/infra/web/filters/usecases/like/like-access-denied-usecase-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Response } from 'express';
import { LikeAccessDeniedUsecaseException } from '@/usecases/exceptions/like/like-access-denied.usecase.exception';
import { ExceptionUtils } from '@/shared/utils/exception-utils';
import { LogUtils } from '@/shared/utils/log-utils';

@Catch(LikeAccessDeniedUsecaseException)
export class LikeAccessDeniedUsecaseExceptionFilter implements ExceptionFilter {
  public catch(exception: LikeAccessDeniedUsecaseException, host: ArgumentsHost) {
    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.FORBIDDEN;

    const responseData = ExceptionUtils.buildErrorResponse(exception, status);
    response.status(status).json(responseData);
  }
}

export const LikeAccessDeniedUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: LikeAccessDeniedUsecaseExceptionFilter,
};
// src/infra/web/filters/usecases/like/like-not-found-usecase-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Response } from 'express';
import { LikeNotFoundUsecaseException } from '@/usecases/exceptions/like/like-not-found.usecase.exception';
import { ExceptionUtils } from '@/shared/utils/exception-utils';
import { LogUtils } from '@/shared/utils/log-utils';

@Catch(LikeNotFoundUsecaseException)
export class LikeNotFoundUsecaseExceptionFilter implements ExceptionFilter {
  public catch(exception: LikeNotFoundUsecaseException, host: ArgumentsHost) {
    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.NOT_FOUND;

    const responseData = ExceptionUtils.buildErrorResponse(exception, status);
    response.status(status).json(responseData);
  }
}

export const LikeNotFoundUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: LikeNotFoundUsecaseExceptionFilter,
};
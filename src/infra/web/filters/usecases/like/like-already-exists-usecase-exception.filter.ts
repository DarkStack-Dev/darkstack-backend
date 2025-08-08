// src/infra/web/filters/usecases/like/like-already-exists-usecase-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Response } from 'express';
import { LikeAlreadyExistsUsecaseException } from '@/usecases/exceptions/like/like-already-exists.usecase.exception';
import { ExceptionUtils } from '@/shared/utils/exception-utils';
import { LogUtils } from '@/shared/utils/log-utils';

@Catch(LikeAlreadyExistsUsecaseException)
export class LikeAlreadyExistsUsecaseExceptionFilter implements ExceptionFilter {
  public catch(exception: LikeAlreadyExistsUsecaseException, host: ArgumentsHost) {
    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.CONFLICT;

    const responseData = ExceptionUtils.buildErrorResponse(exception, status);
    response.status(status).json(responseData);
  }
}

export const LikeAlreadyExistsUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: LikeAlreadyExistsUsecaseExceptionFilter,
};
// src/infra/web/filters/usecases/article/article-limit-reached-usecase-exception.filter.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Response } from 'express';
import { ExceptionUtils } from 'src/shared/utils/exception-utils';
import { LogUtils } from 'src/shared/utils/log-utils';
import { InvalidInputUsecaseException } from '@/usecases/exceptions/input/invalid-input.usecase.exception';

// Filter específico para limite de artigos atingido
@Catch(InvalidInputUsecaseException)
export class ArticleLimitReachedUsecaseExceptionFilter implements ExceptionFilter {
  public catch(exception: InvalidInputUsecaseException, host: ArgumentsHost) {
    // Só capturar se for relacionado ao limite de artigos
    if (!exception.message.includes('limit') && !exception.message.includes('máximo')) {
      return; // Deixar outros filters handlearem
    }

    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.BAD_REQUEST;

    const responseData = ExceptionUtils.buildErrorResponse(exception, status);
    response.status(status).json(responseData);
  }
}

export const ArticleLimitReachedUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: ArticleLimitReachedUsecaseExceptionFilter,
};
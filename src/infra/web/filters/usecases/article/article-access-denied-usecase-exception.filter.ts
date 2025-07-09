// src/infra/web/filters/usecases/article/article-access-denied-usecase-exception.filter.ts
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

// Filter específico para acesso negado a artigos
@Catch(InvalidInputUsecaseException)
export class ArticleAccessDeniedUsecaseExceptionFilter implements ExceptionFilter {
  public catch(exception: InvalidInputUsecaseException, host: ArgumentsHost) {
    // Só capturar se for relacionado a permissões
    if (!exception.message.includes('permissão') && !exception.message.includes('permission')) {
      return; // Deixar outros filters handlearem
    }

    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.FORBIDDEN;

    const responseData = ExceptionUtils.buildErrorResponse(exception, status);
    response.status(status).json(responseData);
  }
}

export const ArticleAccessDeniedUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: ArticleAccessDeniedUsecaseExceptionFilter,
};

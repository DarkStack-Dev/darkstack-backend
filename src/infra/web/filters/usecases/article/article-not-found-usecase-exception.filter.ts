// src/infra/web/filters/usecases/article/article-not-found-usecase-exception.filter.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Response } from 'express';
import { ArticleNotFoundUsecaseException } from '@/usecases/exceptions/article/article-not-found.usecase.exception';
import { ExceptionUtils } from 'src/shared/utils/exception-utils';
import { LogUtils } from 'src/shared/utils/log-utils';

@Catch(ArticleNotFoundUsecaseException)
export class ArticleNotFoundUsecaseExceptionFilter implements ExceptionFilter {
  public catch(exception: ArticleNotFoundUsecaseException, host: ArgumentsHost) {
    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.NOT_FOUND;

    const responseData = ExceptionUtils.buildErrorResponse(exception, status);
    response.status(status).json(responseData);
  }
}

export const ArticleNotFoundUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: ArticleNotFoundUsecaseExceptionFilter,
};
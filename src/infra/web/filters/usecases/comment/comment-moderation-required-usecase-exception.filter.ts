
// src/infra/web/filters/usecases/comment/comment-moderation-required-usecase-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Response } from 'express';
import { CommentModerationRequiredUsecaseException } from '@/usecases/exceptions/comment/comment-moderation-required.usecase.exception';
import { ExceptionUtils } from '@/shared/utils/exception-utils';
import { LogUtils } from '@/shared/utils/log-utils';

@Catch(CommentModerationRequiredUsecaseException)
export class CommentModerationRequiredUsecaseExceptionFilter implements ExceptionFilter {
  public catch(exception: CommentModerationRequiredUsecaseException, host: ArgumentsHost) {
    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.ACCEPTED; // 202 - Aceito mas aguardando processamento

    const responseData = {
      ...ExceptionUtils.buildErrorResponse(exception, status),
      message: 'Comentário criado e enviado para moderação',
      needsModeration: true,
    };
    
    response.status(status).json(responseData);
  }
}

export const CommentModerationRequiredUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: CommentModerationRequiredUsecaseExceptionFilter,
};
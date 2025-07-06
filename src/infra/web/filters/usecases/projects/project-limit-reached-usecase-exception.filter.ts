
// src/infra/web/filters/usecases/projects/project-limit-reached-usecase-exception.filter.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Response } from 'express';
import { ProjectLimitReachedUsecaseException } from '@/usecases/exceptions/projects/project-limit-reached.usecase.exception';
import { ExceptionUtils } from 'src/shared/utils/exception-utils';
import { LogUtils } from 'src/shared/utils/log-utils';

@Catch(ProjectLimitReachedUsecaseException)
export class ProjectLimitReachedUsecaseExceptionFilter implements ExceptionFilter {
  public catch(exception: ProjectLimitReachedUsecaseException, host: ArgumentsHost) {
    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.BAD_REQUEST;

    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json(aResponseData);
  }
}

export const ProjectLimitReachedUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: ProjectLimitReachedUsecaseExceptionFilter,
};
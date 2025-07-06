// src/infra/web/filters/usecases/projects/project-not-found-usecase-exception.filter.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Response } from 'express';
import { ProjectNotFoundUsecaseException } from '@/usecases/exceptions/projects/project-not-found.usecase.exception';
import { ExceptionUtils } from 'src/shared/utils/exception-utils';
import { LogUtils } from 'src/shared/utils/log-utils';

@Catch(ProjectNotFoundUsecaseException)
export class ProjectNotFoundUsecaseExceptionFilter implements ExceptionFilter {
  public catch(exception: ProjectNotFoundUsecaseException, host: ArgumentsHost) {
    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.NOT_FOUND;

    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json(aResponseData);
  }
}

export const ProjectNotFoundUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: ProjectNotFoundUsecaseExceptionFilter,
};
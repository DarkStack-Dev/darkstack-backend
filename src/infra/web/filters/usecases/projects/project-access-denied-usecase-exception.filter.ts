// src/infra/web/filters/usecases/projects/project-access-denied-usecase-exception.filter.ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { Response } from 'express';
import { ProjectAccessDeniedUsecaseException } from '@/usecases/exceptions/projects/project-access-denied.usecase.exception';
import { ExceptionUtils } from 'src/shared/utils/exception-utils';
import { LogUtils } from 'src/shared/utils/log-utils';

@Catch(ProjectAccessDeniedUsecaseException)
export class ProjectAccessDeniedUsecaseExceptionFilter implements ExceptionFilter {
  public catch(exception: ProjectAccessDeniedUsecaseException, host: ArgumentsHost) {
    LogUtils.logException(exception);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = HttpStatus.FORBIDDEN;

    const aResponseData = ExceptionUtils.buildErrorResponse(exception, status);

    response.status(status).json(aResponseData);
  }
}

export const ProjectAccessDeniedUsecaseExceptionFilterProvider = {
  provide: APP_FILTER,
  useClass: ProjectAccessDeniedUsecaseExceptionFilter,
};
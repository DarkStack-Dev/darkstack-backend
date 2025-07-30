
// 📁 src/usecases/exceptions/projects/project-limit-reached.usecase.exception.ts
import { UsecaseException } from '../usecase.exception';

export class ProjectLimitReachedUsecaseException extends UsecaseException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ) {
    super(internalMessage, externalMessage, context);
    this.name = ProjectLimitReachedUsecaseException.name;
  }
}
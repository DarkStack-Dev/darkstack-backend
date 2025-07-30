
// 📁 src/usecases/exceptions/projects/project-not-found.usecase.exception.ts
import { UsecaseException } from '../usecase.exception';

export class ProjectNotFoundUsecaseException extends UsecaseException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ) {
    super(internalMessage, externalMessage, context);
    this.name = ProjectNotFoundUsecaseException.name;
  }
}
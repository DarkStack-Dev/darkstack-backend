
// 📁 src/usecases/exceptions/projects/project-access-denied.usecase.exception.ts
import { UsecaseException } from '../usecase.exception';

export class ProjectAccessDeniedUsecaseException extends UsecaseException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ) {
    super(internalMessage, externalMessage, context);
    this.name = ProjectAccessDeniedUsecaseException.name;
  }
}
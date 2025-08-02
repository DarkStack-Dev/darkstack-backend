// src/domain/usecases/exceptions/notification/notification-not-found.usecase.exception.ts
import { UseCaseException } from '../usecase.exception';

export class NotificationNotFoundUsecaseException extends UseCaseException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ){
    super(internalMessage, externalMessage, context);
    this.name = NotificationNotFoundUsecaseException.name;
  }
}

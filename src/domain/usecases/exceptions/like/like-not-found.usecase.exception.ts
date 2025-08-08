
// src/domain/usecases/exceptions/like/like-not-found.usecase.exception.ts
import { UseCaseException } from '../usecase.exception';

export class LikeNotFoundUsecaseException extends UseCaseException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ){
    super(internalMessage, externalMessage, context);
    this.name = LikeNotFoundUsecaseException.name;
  }
}
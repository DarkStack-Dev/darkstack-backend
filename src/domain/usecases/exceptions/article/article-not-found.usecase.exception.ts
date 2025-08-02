// src/domain/usecases/exceptions/article/article-not-found.usecase.exception.ts
import { UseCaseException } from '../usecase.exception';

export class ArticleNotFoundUsecaseException extends UseCaseException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ){
    super(internalMessage, externalMessage, context);
    this.name = ArticleNotFoundUsecaseException.name;
  }
}
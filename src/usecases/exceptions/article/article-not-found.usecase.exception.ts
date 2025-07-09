// src/usecases/exceptions/article/article-not-found.usecase.exception.ts
import { UsecaseException } from '../usecase.exception';

export class ArticleNotFoundUsecaseException extends UsecaseException {
  public constructor(
    internalMessage: string,
    externalMessage: string,
    context: string,
  ) {
    super(internalMessage, externalMessage, context);
    this.name = ArticleNotFoundUsecaseException.name;
  }
}
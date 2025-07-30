// src/usecases/article/popular-tags/popular-tags.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { PopularTagsUseCase as DomainPopularTagsUseCase } from '@/domain/usecases/article/popular-tags/popular-tags.usecase';
import { InvalidInputUsecaseException } from '@/usecases/exceptions/input/invalid-input.usecase.exception';

export type PopularTagsInput = {
  limit?: number;
};

export type PopularTagsOutput = {
  tags: Array<{
    tag: string;
    count: number;
    percentage: number;
  }>;
  total: number;
};

@Injectable()
export class PopularTagsUsecase implements Usecase<PopularTagsInput, PopularTagsOutput> {
  constructor(
    private readonly domainPopularTagsUseCase: DomainPopularTagsUseCase,
  ) {}

  async execute(input: PopularTagsInput): Promise<PopularTagsOutput> {
    try {
      return await this.domainPopularTagsUseCase.execute(input);
    } catch (error) {
      if (error.name === 'InvalidInputUsecaseException') {
        throw new InvalidInputUsecaseException(
          error.internalMessage || `Invalid input in ${PopularTagsUsecase.name}`,
          error.externalMessage || 'Dados inválidos',
          PopularTagsUsecase.name,
        );
      }

      throw error;
    }
  }
}
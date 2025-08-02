// src/usecases/article/create/create-article.usecase.ts - APPLICATION LAYER WEBSOCKET
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { CreateArticleUseCase as DomainCreateArticleUseCase } from '@/domain/usecases/article/create/create-article.usecase';
import { UserNotFoundUsecaseException } from '@/usecases/exceptions/user/user-not-found.usecase.exception';
import { ArticleCategory } from 'generated/prisma';
import { ArticleImageDto } from '@/domain/entities/article/article.entity';

export type CreateArticleInput = {
  titulo: string;
  descricao: string;
  conteudo: string;
  categoria: ArticleCategory;
  tags: string[];
  images: ArticleImageDto[];
  userId: string;
};

export type CreateArticleOutput = {
  id: string;
  titulo: string;
  slug: string;
  status: string;
  createdAt: Date;
  moderatorsNotified: number;
  realTimeNotificationSent: boolean;
  message: string;
};

@Injectable()
export class CreateArticleUsecase implements Usecase<CreateArticleInput, CreateArticleOutput> {
  constructor(
    private readonly domainCreateArticleUseCase: DomainCreateArticleUseCase,
  ) {}

  async execute(input: CreateArticleInput): Promise<CreateArticleOutput> {
    try {
      const result = await this.domainCreateArticleUseCase.execute(input);

      let message = 'Artigo criado com sucesso! ';
      
      if (result.realTimeNotificationSent) {
        message += `${result.moderatorsNotified} moderadores foram notificados em tempo real.`;
      } else {
        message += `${result.moderatorsNotified} moderadores foram notificados (offline).`;
      }

      return {
        id: result.id,
        titulo: result.titulo,
        slug: result.slug,
        status: result.status,
        createdAt: result.createdAt,
        moderatorsNotified: result.moderatorsNotified,
        realTimeNotificationSent: result.realTimeNotificationSent,
        message,
      };
    } catch (error) {
      // Mapear exceptions do domínio para aplicação
      if (error.name === 'UserNotFoundUsecaseException') {
        throw new UserNotFoundUsecaseException(
          error.internalMessage || `User not found in ${CreateArticleUsecase.name}`,
          error.externalMessage || 'Usuário não encontrado',
          CreateArticleUsecase.name,
        );
      }

      throw error;
    }
  }
}
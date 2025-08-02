// src/usecases/article/reject/reject-article.usecase.ts - APPLICATION LAYER WEBSOCKET
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { RejectArticleUseCase as DomainRejectUseCase } from '@/domain/usecases/article/reject/reject-article.usecase';

export type RejectArticleInput = {
  articleId: string;
  moderatorId: string;
  rejectionReason: string;
};

export type RejectArticleOutput = {
  id: string;
  titulo: string;
  status: string;
  rejectionReason: string;
  authorNotified: boolean;
  realTimeNotificationSent: boolean;
  message: string;
};

@Injectable()
export class RejectArticleUsecase implements Usecase<RejectArticleInput, RejectArticleOutput> {
  constructor(
    private readonly domainRejectUseCase: DomainRejectUseCase,
  ) {}

  async execute(input: RejectArticleInput): Promise<RejectArticleOutput> {
    const result = await this.domainRejectUseCase.execute(input);
    
    let message = 'Artigo rejeitado. ';
    
    if (result.realTimeNotificationSent) {
      message += 'Autor foi notificado em tempo real com o feedback.';
    } else {
      message += 'Autor foi notificado (receberá quando conectar).';
    }
    
    return {
      ...result,
      message,
    };
  }
}
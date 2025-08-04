// src/usecases/article/approve/approve-article.usecase.ts - APPLICATION LAYER WEBSOCKET
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { ApproveArticleUseCase as DomainApproveUseCase } from '@/domain/usecases/article/approve/approve-article.usecase';

export type ApproveArticleInput = {
  articleId: string;
  moderatorId: string;
};

export type ApproveArticleOutput = {
  id: string;
  titulo: string;
  status: string;
  approvedAt: Date;
  authorNotified: boolean;
  realTimeNotificationSent: boolean;
  message: string;
};

@Injectable()
export class ApproveArticleUsecase implements Usecase<ApproveArticleInput, ApproveArticleOutput> {
  constructor(
    private readonly domainApproveUseCase: DomainApproveUseCase,
  ) {}

  async execute(input: ApproveArticleInput): Promise<ApproveArticleOutput> {
    const result = await this.domainApproveUseCase.execute(input);
    
    let message = 'Artigo aprovado com sucesso! ';
    
    if (result.realTimeNotificationSent) {
      message += 'Autor foi notificado em tempo real.';
    } else {
      message += 'Autor foi notificado (receberá quando conectar).';
    }
    
    return {
      ...result,
      message,
    };
  }
}
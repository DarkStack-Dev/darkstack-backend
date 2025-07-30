// src/infra/web/routes/article/pending-moderation/pending-moderation.presenter.ts
import { GetPendingModerationOutput } from '@/usecases/article/get-pending-moderation/get-pending-moderation.usecase';

export type PendingModerationResponse = {
  articles: Array<{
    id: string;
    titulo: string;
    slug: string;
    descricao: string;
    categoria: string;
    tags: string[];
    createdAt: Date;
    tempoLeituraMinutos?: number;
    author: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
    mainImage?: {
      url: string;
      alt?: string;
    };
  }>;
  total: number;
  moderator: {
    id: string;
    name: string;
    email: string;
  };
};

export class PendingModerationPresenter {
  public static toHttp(output: GetPendingModerationOutput): PendingModerationResponse {
    return {
      articles: output.articles,
      total: output.total,
      moderator: output.moderator,
    };
  }
}
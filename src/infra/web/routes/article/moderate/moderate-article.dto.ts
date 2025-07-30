// src/infra/web/routes/article/moderate/moderate-article.dto.ts
export type ModerateArticleRequest = {
  action: 'approve' | 'reject';
  rejectionReason?: string;
};

export type ModerateArticleResponse = {
  success: boolean;
  message: string;
  article: {
    id: string;
    titulo: string;
    status: string;
    author: {
      id: string;
      name: string;
      email: string;
    };
  };
  moderator: {
    id: string;
    name: string;
    email: string;
  };
  moderatedAt: Date;
};

// src/infra/web/routes/article/find-by-id/find-article-by-id.dto.ts
export type FindArticleByIdResponse = {
  id: string;
  titulo: string;
  slug: string;
  descricao: string;
  conteudo?: string;
  categoria: string;
  tags: string[];
  status: string;
  visualizacoes: number;
  tempoLeituraMinutos?: number;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  approver?: {
    id: string;
    name: string;
    email: string;
  };
  approvedAt?: Date;
  rejectionReason?: string;
  images: Array<{
    id: string;
    filename: string;
    url: string;
    alt?: string;
    order: number;
    isMain: boolean;
  }>;
  isOwner: boolean;
  canEdit: boolean;
};

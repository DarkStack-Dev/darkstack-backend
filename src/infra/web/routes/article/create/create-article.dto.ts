// src/infra/web/routes/article/create/create-article.dto.ts
import { ArticleImageDto } from "@/domain/entities/article/article.entity";
import { ArticleCategory } from "generated/prisma";

export type CreateArticleRequest = {
  titulo: string;
  descricao: string;
  conteudo: string;
  categoria: ArticleCategory;
  tags: string[];
  images?: ArticleImageDto[];
};

export type CreateArticleResponse = {
  id: string;
  titulo: string;
  slug: string;
  status: string;
  createdAt: Date;
  message: string;
};
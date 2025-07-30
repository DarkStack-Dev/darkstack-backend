// src/infra/web/routes/article/find-by-id/find-article-by-id.presenter.ts
import { FindArticleByIdOutput } from '@/usecases/article/find-by-id/find-article-by-id.usecase';
import { FindArticleByIdResponse } from './find-article-by-id.dto';

export class FindArticleByIdPresenter {
  public static toHttp(output: FindArticleByIdOutput): FindArticleByIdResponse {
    return {
      id: output.id,
      titulo: output.titulo,
      slug: output.slug,
      descricao: output.descricao,
      conteudo: output.conteudo,
      categoria: output.categoria,
      tags: output.tags,
      status: output.status,
      visualizacoes: output.visualizacoes,
      tempoLeituraMinutos: output.tempoLeituraMinutos,
      createdAt: output.createdAt,
      updatedAt: output.updatedAt,
      author: output.author,
      approver: output.approver,
      approvedAt: output.approvedAt,
      rejectionReason: output.rejectionReason,
      images: output.images,
      isOwner: output.isOwner,
      canEdit: output.canEdit,
    };
  }
}
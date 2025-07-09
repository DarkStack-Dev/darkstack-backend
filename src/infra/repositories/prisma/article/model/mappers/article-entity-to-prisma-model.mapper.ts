// src/infra/repositories/prisma/article/model/mappers/article-entity-to-prisma-model.mapper.ts
import { Article } from '@/domain/entities/article/article.entity';

export class ArticleEntityToPrismaModelMapper {
  public static map(article: Article) {
    const images = article.getImages().map(img => ({
      id: img.id,
      filename: img.filename,
      type: img.type,
      size: img.size,
      width: img.width,
      height: img.height,
      base64: img.base64,
      url: img.url,
      alt: img.alt,
      metadata: img.metadata,
      order: img.order,
      isMain: img.isMain,
    }));

    return {
      id: article.getId(),
      titulo: article.getTitulo(),
      slug: article.getSlug(),
      descricao: article.getDescricao(),
      conteudo: article.getConteudo(),
      categoria: article.getCategoria(),
      tags: article.getTags(),
      status: article.getStatus(),
      visualizacoes: article.getVisualizacoes(),
      tempoLeituraMinutos: article.getTempoLeituraMinutos(),
      authorId: article.getAuthorId(),
      approvedById: article.getApprovedById(),
      approvedAt: article.getApprovedAt(),
      rejectionReason: article.getRejectionReason(),
      createdAt: article.getCreatedAt(),
      updatedAt: article.getUpdatedAt(),
      isActive: article.getIsActivate(),
      deletedAt: article.getDeletedAt(),
      images,
    };
  }
}
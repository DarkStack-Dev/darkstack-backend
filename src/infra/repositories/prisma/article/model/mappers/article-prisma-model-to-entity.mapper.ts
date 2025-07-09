// src/infra/repositories/prisma/article/model/mappers/article-prisma-model-to-entity.mapper.ts
import { Article } from '@/domain/entities/article/article.entity';

export class ArticlePrismaModelToEntityMapper {
  public static map(model: any): Article {
    const images = (model.images || []).map((img: any) => ({
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

    return Article.with({
      id: model.id,
      titulo: model.titulo,
      slug: model.slug,
      descricao: model.descricao,
      conteudo: model.conteudo || '', // Pode estar ausente se includeContent = false
      categoria: model.categoria,
      tags: model.tags || [],
      status: model.status,
      visualizacoes: model.visualizacoes || 0,
      tempoLeituraMinutos: model.tempoLeituraMinutos,
      authorId: model.authorId,
      approvedById: model.approvedById,
      approvedAt: model.approvedAt,
      rejectionReason: model.rejectionReason,
      images,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      isActive: model.isActive,
      deletedAt: model.deletedAt,
    });
  }
}
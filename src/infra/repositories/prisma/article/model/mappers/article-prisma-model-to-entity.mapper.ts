// src/infra/repositories/prisma/article/model/mappers/article-prisma-model-to-entity.mapper.ts - MELHORADO
import { Article } from '@/domain/entities/article/article.entity';

export class ArticlePrismaModelToEntityMapper {
  public static map(model: any, includeContent: boolean = true): Article {
    // ✅ MELHORADO: Log de debug para entender os dados
    console.log(`[ArticlePrismaModelToEntityMapper] Mapping article ${model.id}:`, {
      status: model.status,
      approvedById: model.approvedById,
      approvedAt: model.approvedAt,
      rejectionReason: model.rejectionReason,
      deletedAt: model.deletedAt,
      includeContent,
    });

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

    // ✅ MELHORADO: Usar placeholder especial quando conteúdo não for carregado
    const conteudo = includeContent ? (model.conteudo || '') : 'CONTENT_NOT_LOADED';

    return Article.with({
      id: model.id,
      titulo: model.titulo,
      slug: model.slug,
      descricao: model.descricao,
      conteudo,
      categoria: model.categoria,
      tags: model.tags || [],
      status: model.status,
      visualizacoes: model.visualizacoes || 0,
      tempoLeituraMinutos: model.tempoLeituraMinutos,
      authorId: model.authorId,
      approvedById: model.approvedById, // null se não aprovado
      approvedAt: model.approvedAt, // null se não aprovado
      rejectionReason: model.rejectionReason, // null se não rejeitado
      images,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      isActive: model.isActive,
      deletedAt: model.deletedAt, // null se não deletado
    });
  }
}
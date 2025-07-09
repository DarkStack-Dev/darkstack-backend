// src/infra/repositories/prisma/article/article.prisma.repository.ts
import { Injectable } from '@nestjs/common';
import { ArticleGatewayRepository, ArticleSearchFilters, PaginatedArticleResult, ArticleStatsResult } from '@/domain/repositories/article/article.gateway.repository';
import { Article } from '@/domain/entities/article/article.entity';
import { prismaClient } from '../client.prisma';
import { ArticlePrismaModelToEntityMapper } from './model/mappers/article-prisma-model-to-entity.mapper';
import { ArticleEntityToPrismaModelMapper } from './model/mappers/article-entity-to-prisma-model.mapper';
import { ArticleStatus, ArticleCategory } from 'generated/prisma';

@Injectable()
export class ArticlePrismaRepository extends ArticleGatewayRepository {
  
  async findById(id: string, includeContent = true): Promise<Article | null> {
    const model = await prismaClient.article.findUnique({
      where: { id, deletedAt: null },
      include: {
        author: true,
        approvedBy: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
      ...(includeContent ? {} : {
        select: {
          id: true,
          titulo: true,
          slug: true,
          descricao: true,
          categoria: true,
          tags: true,
          status: true,
          visualizacoes: true,
          tempoLeituraMinutos: true,
          authorId: true,
          approvedById: true,
          approvedAt: true,
          rejectionReason: true,
          createdAt: true,
          updatedAt: true,
          isActive: true,
          deletedAt: true,
          author: true,
          approvedBy: true,
          images: {
            orderBy: { order: 'asc' },
          },
        },
      }),
    });

    return model ? ArticlePrismaModelToEntityMapper.map(model) : null;
  }

  async findBySlug(slug: string, includeContent = true): Promise<Article | null> {
    const model = await prismaClient.article.findUnique({
      where: { slug, deletedAt: null },
      include: {
        author: true,
        approvedBy: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
      ...(includeContent ? {} : {
        select: {
          id: true,
          titulo: true,
          slug: true,
          descricao: true,
          categoria: true,
          tags: true,
          status: true,
          visualizacoes: true,
          tempoLeituraMinutos: true,
          authorId: true,
          approvedById: true,
          approvedAt: true,
          rejectionReason: true,
          createdAt: true,
          updatedAt: true,
          isActive: true,
          deletedAt: true,
          author: true,
          approvedBy: true,
          images: {
            orderBy: { order: 'asc' },
          },
        },
      }),
    });

    return model ? ArticlePrismaModelToEntityMapper.map(model) : null;
  }

  async findByIdIncludingDeleted(id: string): Promise<Article | null> {
    const model = await prismaClient.article.findUnique({
      where: { id },
      include: {
        author: true,
        approvedBy: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return model ? ArticlePrismaModelToEntityMapper.map(model) : null;
  }

  async findAll(filters?: ArticleSearchFilters): Promise<PaginatedArticleResult> {
    const {
      search,
      authorId,
      categoria,
      tags,
      status = ArticleStatus.APPROVED,
      isActive = true,
      approvedById,
      createdAfter,
      createdBefore,
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeContent = false,
    } = filters || {};

    const where: any = {
      deletedAt: null,
      isActive,
      status,
    };

    if (search) {
      where.OR = [
        { titulo: { contains: search, mode: 'insensitive' } },
        { descricao: { contains: search, mode: 'insensitive' } },
        ...(includeContent ? [{ conteudo: { contains: search, mode: 'insensitive' } }] : []),
      ];
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (categoria) {
      where.categoria = categoria;
    }

    if (tags && tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    if (approvedById) {
      where.approvedById = approvedById;
    }

    if (createdAfter || createdBefore) {
      where.createdAt = {};
      if (createdAfter) where.createdAt.gte = createdAfter;
      if (createdBefore) where.createdAt.lte = createdBefore;
    }

    const [articles, total] = await Promise.all([
      prismaClient.article.findMany({
        where,
        include: {
          author: true,
          approvedBy: true,
          images: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        take: limit,
        skip: offset,
        ...(includeContent ? {} : {
          select: {
            id: true,
            titulo: true,
            slug: true,
            descricao: true,
            categoria: true,
            tags: true,
            status: true,
            visualizacoes: true,
            tempoLeituraMinutos: true,
            authorId: true,
            approvedById: true,
            approvedAt: true,
            rejectionReason: true,
            createdAt: true,
            updatedAt: true,
            isActive: true,
            deletedAt: true,
            author: true,
            approvedBy: true,
            images: {
              orderBy: { order: 'asc' },
            },
          },
        }),
      }),
      prismaClient.article.count({ where }),
    ]);

    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return {
      articles: articles.map(ArticlePrismaModelToEntityMapper.map),
      total,
      page,
      pageSize: limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  async create(article: Article): Promise<void> {
    const data = ArticleEntityToPrismaModelMapper.map(article);
    const { images, ...articleData } = data;

    await prismaClient.$transaction(async (tx) => {
      // Criar o artigo
      await tx.article.create({ data: articleData });

      // Criar as imagens se existirem
      if (images && images.length > 0) {
        await tx.articleImage.createMany({
          data: images.map(img => ({
            ...img,
            articleId: article.getId(),
          })),
        });
      }
    });
  }

  async update(article: Article): Promise<void> {
    const data = ArticleEntityToPrismaModelMapper.map(article);
    const { images, ...articleData } = data;

    await prismaClient.$transaction(async (tx) => {
      // Atualizar o artigo
      await tx.article.update({
        where: { id: article.getId() },
        data: articleData,
      });

      // Remover imagens existentes
      await tx.articleImage.deleteMany({
        where: { articleId: article.getId() },
      });

      // Criar novas imagens se existirem
      if (images && images.length > 0) {
        await tx.articleImage.createMany({
          data: images.map(img => ({
            ...img,
            articleId: article.getId(),
          })),
        });
      }
    });
  }

  async softDelete(id: string): Promise<void> {
    await prismaClient.article.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        updatedAt: new Date(),
      },
    });
  }

  async hardDelete(id: string): Promise<void> {
    await prismaClient.$transaction(async (tx) => {
      // Deletar imagens primeiro (cascade)
      await tx.articleImage.deleteMany({
        where: { articleId: id },
      });
      
      // Deletar artigo
      await tx.article.delete({
        where: { id },
      });
    });
  }

  async restore(id: string): Promise<void> {
    await prismaClient.article.update({
      where: { id },
      data: {
        deletedAt: null,
        isActive: true,
        updatedAt: new Date(),
      },
    });
  }

  async findByAuthorId(authorId: string, includeContent = false): Promise<Article[]> {
    const models = await prismaClient.article.findMany({
      where: { authorId, deletedAt: null },
      include: {
        author: true,
        approvedBy: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      ...(includeContent ? {} : {
        select: {
          id: true,
          titulo: true,
          slug: true,
          descricao: true,
          categoria: true,
          tags: true,
          status: true,
          visualizacoes: true,
          tempoLeituraMinutos: true,
          authorId: true,
          approvedById: true,
          approvedAt: true,
          rejectionReason: true,
          createdAt: true,
          updatedAt: true,
          isActive: true,
          deletedAt: true,
          author: true,
          approvedBy: true,
          images: {
            orderBy: { order: 'asc' },
          },
        },
      }),
    });

    return models.map(ArticlePrismaModelToEntityMapper.map);
  }

  async findByCategory(categoria: ArticleCategory, filters?: Partial<ArticleSearchFilters>): Promise<Article[]> {
    const where: any = {
      categoria,
      deletedAt: null,
      isActive: true,
      status: ArticleStatus.APPROVED,
      ...filters,
    };

    const models = await prismaClient.article.findMany({
      where,
      include: {
        author: true,
        approvedBy: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return models.map(ArticlePrismaModelToEntityMapper.map);
  }

  async findByTag(tag: string, filters?: Partial<ArticleSearchFilters>): Promise<Article[]> {
    const where: any = {
      tags: { has: tag },
      deletedAt: null,
      isActive: true,
      status: ArticleStatus.APPROVED,
      ...filters,
    };

    const models = await prismaClient.article.findMany({
      where,
      include: {
        author: true,
        approvedBy: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return models.map(ArticlePrismaModelToEntityMapper.map);
  }

  async findByStatus(status: ArticleStatus, filters?: Partial<ArticleSearchFilters>): Promise<Article[]> {
    const where: any = {
      status,
      deletedAt: null,
      ...filters,
    };

    const models = await prismaClient.article.findMany({
      where,
      include: {
        author: true,
        approvedBy: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return models.map(ArticlePrismaModelToEntityMapper.map);
  }

  async findPublished(filters?: Partial<ArticleSearchFilters>): Promise<PaginatedArticleResult> {
    return this.findAll({
      ...filters,
      status: ArticleStatus.APPROVED,
      isActive: true,
    });
  }

  async findPending(filters?: Partial<ArticleSearchFilters>): Promise<Article[]> {
    return this.findByStatus(ArticleStatus.PENDING, filters);
  }

  async findRejected(filters?: Partial<ArticleSearchFilters>): Promise<Article[]> {
    return this.findByStatus(ArticleStatus.REJECTED, filters);
  }

  async findForModeration(moderatorId?: string): Promise<Article[]> {
    const where: any = {
      status: ArticleStatus.PENDING,
      deletedAt: null,
      isActive: true,
    };

    if (moderatorId) {
      // Se especificado, buscar artigos que este moderador pode revisar
      // Por exemplo, excluir artigos que ele já rejeitou
      where.NOT = {
        approvedById: moderatorId,
      };
    }

    const models = await prismaClient.article.findMany({
      where,
      include: {
        author: true,
        approvedBy: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' }, // Mais antigos primeiro
    });

    return models.map(ArticlePrismaModelToEntityMapper.map);
  }

  async findModeratedBy(moderatorId: string): Promise<Article[]> {
    const models = await prismaClient.article.findMany({
      where: {
        approvedById: moderatorId,
        deletedAt: null,
      },
      include: {
        author: true,
        approvedBy: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { approvedAt: 'desc' },
    });

    return models.map(ArticlePrismaModelToEntityMapper.map);
  }

  async count(filters?: Partial<ArticleSearchFilters>): Promise<number> {
    const where: any = { deletedAt: null };

    if (filters?.authorId) where.authorId = filters.authorId;
    if (filters?.status) where.status = filters.status;
    if (filters?.categoria) where.categoria = filters.categoria;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    return prismaClient.article.count({ where });
  }

  async countByAuthor(authorId: string): Promise<number> {
    return prismaClient.article.count({
      where: {
        authorId,
        deletedAt: null,
        isActive: true,
      },
    });
  }

  async countByStatus(status: ArticleStatus): Promise<number> {
    return prismaClient.article.count({
      where: {
        status,
        deletedAt: null,
      },
    });
  }

  async getStats(): Promise<ArticleStatsResult> {
    const [
      totalArticles,
      pendingArticles,
      approvedArticles,
      rejectedArticles,
      archivedArticles,
      viewsAggregate,
      readingTimeAggregate,
      categoryStats,
      topTags,
    ] = await Promise.all([
      this.count(),
      this.countByStatus(ArticleStatus.PENDING),
      this.countByStatus(ArticleStatus.APPROVED),
      this.countByStatus(ArticleStatus.REJECTED),
      this.countByStatus(ArticleStatus.ARCHIVED),
      prismaClient.article.aggregate({
        where: { deletedAt: null },
        _sum: { visualizacoes: true },
      }),
      prismaClient.article.aggregate({
        where: { deletedAt: null, tempoLeituraMinutos: { not: null } },
        _avg: { tempoLeituraMinutos: true },
      }),
      prismaClient.article.groupBy({
        by: ['categoria'],
        where: { deletedAt: null },
        _count: true,
      }),
      this.getPopularTags(10),
    ]);

    const articlesByCategory = {} as Record<ArticleCategory, number>;
    Object.values(ArticleCategory).forEach(cat => {
      articlesByCategory[cat] = 0;
    });
    categoryStats.forEach(stat => {
      articlesByCategory[stat.categoria] = stat._count;
    });

    return {
      totalArticles,
      pendingArticles,
      approvedArticles,
      rejectedArticles,
      archivedArticles,
      totalViews: viewsAggregate._sum.visualizacoes || 0,
      averageReadingTime: Math.round(readingTimeAggregate._avg.tempoLeituraMinutos || 0),
      articlesByCategory,
      topTags,
    };
  }

  async getMostViewed(limit = 10): Promise<Article[]> {
    const models = await prismaClient.article.findMany({
      where: {
        status: ArticleStatus.APPROVED,
        deletedAt: null,
        isActive: true,
      },
      include: {
        author: true,
        approvedBy: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { visualizacoes: 'desc' },
      take: limit,
    });

    return models.map(ArticlePrismaModelToEntityMapper.map);
  }

  async getRecentlyPublished(limit = 10): Promise<Article[]> {
    const models = await prismaClient.article.findMany({
      where: {
        status: ArticleStatus.APPROVED,
        deletedAt: null,
        isActive: true,
      },
      include: {
        author: true,
        approvedBy: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { approvedAt: 'desc' },
      take: limit,
    });

    return models.map(ArticlePrismaModelToEntityMapper.map);
  }

  async getSimilarArticles(articleId: string, limit = 5): Promise<Article[]> {
    // Buscar artigo atual para obter tags e categoria
    const currentArticle = await this.findById(articleId, false);
    if (!currentArticle) return [];

    const models = await prismaClient.article.findMany({
      where: {
        id: { not: articleId },
        status: ArticleStatus.APPROVED,
        deletedAt: null,
        isActive: true,
        OR: [
          { categoria: currentArticle.getCategoria() },
          { tags: { hasSome: currentArticle.getTags() } },
        ],
      },
      include: {
        author: true,
        approvedBy: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return models.map(ArticlePrismaModelToEntityMapper.map);
  }

  async getAllTags(): Promise<string[]> {
    const result = await prismaClient.article.findMany({
      where: {
        status: ArticleStatus.APPROVED,
        deletedAt: null,
        isActive: true,
      },
      select: { tags: true },
    });

    const allTags = result.flatMap(article => article.tags);
    return [...new Set(allTags)].sort();
  }

  async getPopularTags(limit = 20): Promise<Array<{ tag: string; count: number }>> {
    const articles = await prismaClient.article.findMany({
      where: {
        status: ArticleStatus.APPROVED,
        deletedAt: null,
        isActive: true,
      },
      select: { tags: true },
    });

    const tagCounts = new Map<string, number>();
    articles.forEach(article => {
      article.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  async isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
    const where: any = { slug, deletedAt: null };
    if (excludeId) {
      where.id = { not: excludeId };
    }

    const existing = await prismaClient.article.findFirst({ where });
    return !existing;
  }

  async canUserCreateArticle(userId: string): Promise<boolean> {
    const activeArticlesCount = await prismaClient.article.count({
      where: {
        authorId: userId,
        deletedAt: null,
        isActive: true,
        status: { not: ArticleStatus.ARCHIVED },
      },
    });

    return activeArticlesCount < 5; // Máximo 5 artigos
  }

  async incrementViews(id: string): Promise<void> {
    await prismaClient.article.update({
      where: { id },
      data: {
        visualizacoes: { increment: 1 },
        updatedAt: new Date(),
      },
    });
  }

  async updateReadingTime(id: string, minutes: number): Promise<void> {
    await prismaClient.article.update({
      where: { id },
      data: {
        tempoLeituraMinutos: minutes,
        updatedAt: new Date(),
      },
    });
  }

  async findSoftDeleted(): Promise<Article[]> {
    const models = await prismaClient.article.findMany({
      where: { deletedAt: { not: null } },
      include: {
        author: true,
        approvedBy: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { deletedAt: 'desc' },
    });

    return models.map(ArticlePrismaModelToEntityMapper.map);
  }

  async searchByContent(query: string, filters?: Partial<ArticleSearchFilters>): Promise<PaginatedArticleResult> {
    return this.findAll({
      ...filters,
      search: query,
      includeContent: true,
    });
  }

  async findRelatedByTags(articleId: string, limit = 5): Promise<Article[]> {
    return this.getSimilarArticles(articleId, limit);
  }
}
// src/infra/repositories/prisma/comment/comment.prisma.repository.ts - CORRIGIDO
import { Injectable } from '@nestjs/common';
import { 
  CommentGatewayRepository, 
  CommentSearchFilters, 
  CommentWithAuthor, 
  PaginatedCommentResult,
  CommentThreadResult,
  CommentStatistics
} from '@/domain/repositories/comment/comment.gateway.repository';
import { Comment, CommentTarget } from '@/domain/entities/comment/comment.entity';
import { prismaClient } from '../client.prisma';
import { CommentPrismaModelToEntityMapper } from './model/mappers/comment-prisma-model-to-entity.mapper';
import { CommentEntityToPrismaModelMapper } from './model/mappers/comment-entity-to-prisma-model.mapper';

@Injectable()
export class CommentPrismaRepository extends CommentGatewayRepository {

  async findById(id: string): Promise<Comment | null> {
    const model = await prismaClient.comment.findUnique({
      where: { id },
    });

    return model ? CommentPrismaModelToEntityMapper.map(model) : null;
  }

  async findByIdWithAuthor(id: string): Promise<CommentWithAuthor | null> {
    const model = await prismaClient.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          }
        }
      }
    });

    if (!model) return null;

    return {
      comment: CommentPrismaModelToEntityMapper.map(model),
      author: {
        id: model.author.id,
        name: model.author.name,
        email: model.author.email,
        avatar: model.author.avatar || undefined, // ✅ CORRIGIDO: null -> undefined
      }
    };
  }

  async create(comment: Comment): Promise<void> {
    const data = CommentEntityToPrismaModelMapper.map(comment);
    await prismaClient.comment.create({ data });
  }

  async update(comment: Comment): Promise<void> {
    const data = CommentEntityToPrismaModelMapper.map(comment);
    await prismaClient.comment.update({
      where: { id: comment.getId() },
      data,
    });
  }

  async softDelete(id: string): Promise<void> {
    await prismaClient.comment.update({
      where: { id },
      data: {
        isDeleted: true,
        content: '[Comentário removido]',
        updatedAt: new Date(),
      },
    });
  }

  async hardDelete(id: string): Promise<void> {
    await prismaClient.comment.delete({
      where: { id },
    });
  }

  async findAll(filters?: CommentSearchFilters): Promise<PaginatedCommentResult> {
    const {
      targetId,
      targetType,
      authorId,
      parentId,
      approved = true,
      isDeleted = false,
      search,
      limit = 20,
      offset = 0,
      orderBy = 'createdAt',
      orderDirection = 'desc',
    } = filters || {};

    const where: any = {
      approved,
      isDeleted,
    };

    if (targetId) where.targetId = targetId;
    if (targetType) where.targetType = targetType;
    if (authorId) where.authorId = authorId;
    if (parentId !== undefined) where.parentId = parentId;

    if (search) {
      where.content = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const orderByClause = {
      [orderBy]: orderDirection,
    };

    const [comments, total] = await Promise.all([
      prismaClient.comment.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true, 
              email: true,
              avatar: true,
            }
          }
        },
        orderBy: orderByClause,
        take: limit,
        skip: offset,
      }),
      prismaClient.comment.count({ where }),
    ]);

    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    // ✅ CORRIGIDO: Mapear avatar corretamente
    const result: CommentWithAuthor[] = comments.map(model => ({
      comment: CommentPrismaModelToEntityMapper.map(model),
      author: {
        id: model.author.id,
        name: model.author.name,
        email: model.author.email,
        avatar: model.author.avatar || undefined, // null -> undefined
      }
    }));

    return {
      comments: result,
      total,
      page,
      pageSize: limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  async findByTargetId(
    targetId: string,
    targetType: CommentTarget,
    filters?: Omit<CommentSearchFilters, 'targetId' | 'targetType'>
  ): Promise<PaginatedCommentResult> {
    return this.findAll({
      ...filters,
      targetId,
      targetType,
    });
  }

  async findByAuthorId(
    authorId: string,
    filters?: Omit<CommentSearchFilters, 'authorId'>
  ): Promise<PaginatedCommentResult> {
    return this.findAll({
      ...filters,
      authorId,
    });
  }

  async findRootComments(
    targetId: string,
    targetType: CommentTarget,
    filters?: { limit?: number; offset?: number; orderBy?: 'createdAt' | 'repliesCount'; orderDirection?: 'asc' | 'desc' }
  ): Promise<PaginatedCommentResult> {
    return this.findAll({
      targetId,
      targetType,
      parentId: null, // Apenas comentários raiz
      limit: filters?.limit,
      offset: filters?.offset,
      orderBy: filters?.orderBy,
      orderDirection: filters?.orderDirection,
    });
  }

  async findReplies(
    parentId: string,
    filters?: { limit?: number; offset?: number; orderBy?: 'createdAt'; orderDirection?: 'asc' | 'desc' }
  ): Promise<PaginatedCommentResult> {
    return this.findAll({
      parentId,
      limit: filters?.limit,
      offset: filters?.offset,
      orderBy: filters?.orderBy,
      orderDirection: filters?.orderDirection,
    });
  }

  async findThread(
    rootCommentId: string,
    repliesLimit = 10,
    repliesOffset = 0
  ): Promise<CommentThreadResult> {
    // Buscar comentário raiz
    const rootCommentWithAuthor = await this.findByIdWithAuthor(rootCommentId);
    if (!rootCommentWithAuthor) {
      throw new Error('Root comment not found');
    }

    // Buscar respostas
    const repliesResult = await this.findReplies(rootCommentId, {
      limit: repliesLimit,
      offset: repliesOffset,
      orderBy: 'createdAt',
      orderDirection: 'asc',
    });

    // Contar total de respostas (para hasMoreReplies)
    const totalReplies = await this.countReplies(rootCommentId);

    return {
      rootComment: rootCommentWithAuthor,
      replies: repliesResult.comments,
      totalReplies,
      hasMoreReplies: (repliesOffset + repliesLimit) < totalReplies,
    };
  }

  async count(filters?: Partial<CommentSearchFilters>): Promise<number> {
    const where: any = {};

    if (filters?.targetId) where.targetId = filters.targetId;
    if (filters?.targetType) where.targetType = filters.targetType;
    if (filters?.authorId) where.authorId = filters.authorId;
    if (filters?.approved !== undefined) where.approved = filters.approved;
    if (filters?.isDeleted !== undefined) where.isDeleted = filters.isDeleted;

    return prismaClient.comment.count({ where });
  }

  async countByTarget(targetId: string, targetType: CommentTarget, approved = true): Promise<number> {
    return prismaClient.comment.count({
      where: {
        targetId,
        targetType,
        approved,
        isDeleted: false,
      },
    });
  }

  async countReplies(parentId: string, approved = true): Promise<number> {
    return prismaClient.comment.count({
      where: {
        parentId,
        approved,
        isDeleted: false,
      },
    });
  }

  async getStatistics(targetId?: string, targetType?: CommentTarget): Promise<CommentStatistics> {
    const baseWhere: any = {};
    if (targetId) baseWhere.targetId = targetId;
    if (targetType) baseWhere.targetType = targetType;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalComments,
      totalApproved,
      totalPending,
      totalRejected,
      totalDeleted,
      commentsToday,
      commentsThisWeek,
      commentsThisMonth,
      topAuthorsData,
    ] = await Promise.all([
      prismaClient.comment.count({ where: baseWhere }),
      prismaClient.comment.count({ where: { ...baseWhere, approved: true, isDeleted: false } }),
      prismaClient.comment.count({ where: { ...baseWhere, approved: false, isDeleted: false } }),
      prismaClient.comment.count({ where: { ...baseWhere, approved: false, isDeleted: false } }),
      prismaClient.comment.count({ where: { ...baseWhere, isDeleted: true } }),
      prismaClient.comment.count({ where: { ...baseWhere, createdAt: { gte: today } } }),
      prismaClient.comment.count({ where: { ...baseWhere, createdAt: { gte: weekAgo } } }),
      prismaClient.comment.count({ where: { ...baseWhere, createdAt: { gte: monthAgo } } }),
      prismaClient.comment.groupBy({
        by: ['authorId'],
        where: { ...baseWhere, approved: true, isDeleted: false },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
    ]);

    // Buscar nomes dos autores top
    const authorIds = topAuthorsData.map(item => item.authorId);
    const authors = await prismaClient.user.findMany({
      where: { id: { in: authorIds } },
      select: { id: true, name: true },
    });

    const topAuthors = topAuthorsData.map(item => {
      const author = authors.find(a => a.id === item.authorId);
      return {
        authorId: item.authorId,
        authorName: author?.name || 'Unknown',
        count: item._count.id,
      };
    });

    return {
      totalComments,
      totalApproved,
      totalPending,
      totalRejected,
      totalDeleted,
      commentsToday,
      commentsThisWeek,
      commentsThisMonth,
      topAuthors,
    };
  }

  async findPendingModeration(
    filters?: { limit?: number; offset?: number; targetType?: CommentTarget }
  ): Promise<PaginatedCommentResult> {
    return this.findAll({
      approved: false,
      isDeleted: false,
      targetType: filters?.targetType,
      limit: filters?.limit,
      offset: filters?.offset,
      orderBy: 'createdAt',
      orderDirection: 'desc',
    });
  }

  async approve(commentId: string, moderatorId: string): Promise<void> {
    const comment = await this.findById(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    comment.approve(moderatorId);
    await this.update(comment);

    // Atualizar contadores
    await this.updateTargetCommentsCount(comment.getTargetId(), comment.getTargetType());
    const parentId = comment.getParentId();
    if (parentId) {
      await this.incrementRepliesCount(parentId);
    }
  }

  async reject(commentId: string, moderatorId: string, reason: string): Promise<void> {
    const comment = await this.findById(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    comment.reject(moderatorId, reason);
    await this.update(comment);
  }

  async bulkApprove(commentIds: string[], moderatorId: string): Promise<void> {
    await prismaClient.comment.updateMany({
      where: { id: { in: commentIds } },
      data: {
        approved: true,
        approvedById: moderatorId,
        approvedAt: new Date(),
        rejectionReason: null,
        updatedAt: new Date(),
      },
    });

    // Atualizar contadores para cada comentário aprovado
    for (const commentId of commentIds) {
      const comment = await this.findById(commentId);
      if (comment) {
        await this.updateTargetCommentsCount(comment.getTargetId(), comment.getTargetType());
        const parentId = comment.getParentId();
        if (parentId) {
          await this.incrementRepliesCount(parentId);
        }
      }
    }
  }

  async bulkReject(commentIds: string[], moderatorId: string, reason: string): Promise<void> {
    await prismaClient.comment.updateMany({
      where: { id: { in: commentIds } },
      data: {
        approved: false,
        approvedById: moderatorId,
        approvedAt: new Date(),
        rejectionReason: reason,
        updatedAt: new Date(),
      },
    });
  }

  async incrementRepliesCount(parentId: string): Promise<void> {
    await prismaClient.comment.update({
      where: { id: parentId },
      data: {
        repliesCount: { increment: 1 },
        updatedAt: new Date(),
      },
    });
  }

  async decrementRepliesCount(parentId: string): Promise<void> {
    await prismaClient.comment.update({
      where: { id: parentId },
      data: {
        repliesCount: { decrement: 1 },
        updatedAt: new Date(),
      },
    });
  }

  async updateTargetCommentsCount(targetId: string, targetType: CommentTarget): Promise<void> {
    const count = await this.countByTarget(targetId, targetType);

    switch (targetType) {
      case 'ARTICLE':
        await prismaClient.article.update({
          where: { id: targetId },
          data: { commentsCount: count },
        });
        break;

      case 'PROJECT':
        await prismaClient.project.update({
          where: { id: targetId },
          data: { commentsCount: count },
        });
        break;

      // Adicionar outros tipos conforme necessário
    }
  }

  async exists(id: string): Promise<boolean> {
    const count = await prismaClient.comment.count({
      where: { id },
    });
    return count > 0;
  }

  async existsByTargetAndAuthor(targetId: string, targetType: CommentTarget, authorId: string): Promise<boolean> {
    const count = await prismaClient.comment.count({
      where: {
        targetId,
        targetType,
        authorId,
        isDeleted: false,
      },
    });
    return count > 0;
  }

  async canUserComment(userId: string, targetId: string, targetType: CommentTarget): Promise<boolean> {
    // Verificar se usuário existe e está ativo
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { roles: true, isActive: true }, // ✅ CORRIGIDO: roles não role
    });

    if (!user || !user.isActive) {
      return false;
    }

    // Verificar se entidade alvo existe e permite comentários
    switch (targetType) {
      case 'ARTICLE':
        const article = await prismaClient.article.findUnique({
          where: { id: targetId },
          select: { status: true },
        });
        return article?.status === 'APPROVED';

      case 'PROJECT':
        const project = await prismaClient.project.findUnique({
          where: { id: targetId },
        });
        return !!project;

      default:
        return false;
    }
  }

  async getCommentsByDateRange(
    startDate: Date,
    endDate: Date,
    targetId?: string,
    targetType?: CommentTarget
  ): Promise<Array<{ date: string; count: number }>> {
    const where: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      approved: true,
      isDeleted: false,
    };

    if (targetId) where.targetId = targetId;
    if (targetType) where.targetType = targetType;

    const comments = await prismaClient.comment.findMany({
      where,
      select: { createdAt: true },
    });

    // Agrupar por data
    const groupedByDate = comments.reduce((acc, comment) => {
      const date = comment.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(groupedByDate).map(([date, count]) => ({
      date,
      count,
    }));
  }

  async getMostActiveAuthors(
    limit: number,
    targetId?: string,
    targetType?: CommentTarget
  ): Promise<Array<{ authorId: string; authorName: string; count: number }>> {
    const where: any = {
      approved: true,
      isDeleted: false,
    };

    if (targetId) where.targetId = targetId;
    if (targetType) where.targetType = targetType;

    const results = await prismaClient.comment.groupBy({
      by: ['authorId'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    // Buscar nomes dos autores
    const authorIds = results.map(r => r.authorId);
    const authors = await prismaClient.user.findMany({
      where: { id: { in: authorIds } },
      select: { id: true, name: true },
    });

    return results.map(result => {
      const author = authors.find(a => a.id === result.authorId);
      return {
        authorId: result.authorId,
        authorName: author?.name || 'Unknown',
        count: result._count.id,
      };
    });
  }

  async getMostCommentedTargets(
    targetType: CommentTarget,
    limit: number
  ): Promise<Array<{ targetId: string; targetTitle: string; count: number }>> {
    const results = await prismaClient.comment.groupBy({
      by: ['targetId'],
      where: {
        targetType,
        approved: true,
        isDeleted: false,
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    // Buscar títulos das entidades
    const targetIds = results.map(r => r.targetId);
    let targets: Array<{ id: string; title: string }> = [];

    switch (targetType) {
      case 'ARTICLE':
        const articles = await prismaClient.article.findMany({
          where: { id: { in: targetIds } },
          select: { id: true, titulo: true }, // ✅ CORRIGIDO: titulo não title
        });
        targets = articles.map(a => ({ id: a.id, title: a.titulo }));
        break;

      case 'PROJECT':
        const projects = await prismaClient.project.findMany({
          where: { id: { in: targetIds } },
          select: { id: true, name: true },
        });
        targets = projects.map(p => ({ id: p.id, title: p.name }));
        break;
    }

    return results.map(result => {
      const target = targets.find(t => t.id === result.targetId);
      return {
        targetId: result.targetId,
        targetTitle: target?.title || 'Unknown',
        count: result._count.id,
      };
    });
  }
}
// src/infra/repositories/prisma/like/like.prisma.repository.ts
import { Injectable } from '@nestjs/common';
import { 
  LikeGatewayRepository, 
  LikeSearchFilters, 
  LikeWithUser, 
  PaginatedLikeResult,
  LikeStatistics,
  LikeCounts
} from '@/domain/repositories/like/like.gateway.repository';
import { Like, LikeTarget } from '@/domain/entities/like/like.entity';
import { prismaClient } from '../client.prisma';
import { LikePrismaModelToEntityMapper } from './model/mappers/like-prisma-model-to-entity.mapper';
import { LikeEntityToPrismaModelMapper } from './model/mappers/like-entity-to-prisma-model.mapper';

@Injectable()
export class LikePrismaRepository extends LikeGatewayRepository {

  async findById(id: string): Promise<Like | null> {
    const model = await prismaClient.like.findUnique({
      where: { id },
    });

    return model ? LikePrismaModelToEntityMapper.map(model) : null;
  }

  async findByIdWithUser(id: string): Promise<LikeWithUser | null> {
    const model = await prismaClient.like.findUnique({
      where: { id },
      include: {
        user: {
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
      like: LikePrismaModelToEntityMapper.map(model),
      user: {
        id: model.user.id,
        name: model.user.name,
        email: model.user.email,
        avatar: model.user.avatar || undefined,
      }
    };
  }

  async create(like: Like): Promise<void> {
    const data = LikeEntityToPrismaModelMapper.map(like);
    await prismaClient.like.create({ data });
  }

  async update(like: Like): Promise<void> {
    const data = LikeEntityToPrismaModelMapper.map(like);
    await prismaClient.like.update({
      where: { id: like.getId() },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prismaClient.like.delete({
      where: { id },
    });
  }

  async findAll(filters?: LikeSearchFilters): Promise<PaginatedLikeResult> {
    const {
      targetId,
      targetType,
      userId,
      isLike,
      limit = 20,
      offset = 0,
      orderBy = 'createdAt',
      orderDirection = 'desc',
    } = filters || {};

    const where: any = {};

    if (targetId) where.targetId = targetId;
    if (targetType) where.targetType = targetType;
    if (userId) where.userId = userId;
    if (isLike !== undefined) where.isLike = isLike;

    const orderByClause = {
      [orderBy]: orderDirection,
    };

    const [likes, total] = await Promise.all([
      prismaClient.like.findMany({
        where,
        include: {
          user: {
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
      prismaClient.like.count({ where }),
    ]);

    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    const result: LikeWithUser[] = likes.map(model => ({
      like: LikePrismaModelToEntityMapper.map(model),
      user: {
        id: model.user.id,
        name: model.user.name,
        email: model.user.email,
        avatar: model.user.avatar || undefined,
      }
    }));

    return {
      likes: result,
      total,
      page,
      pageSize: limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  async findByUser(
    userId: string,
    filters?: Omit<LikeSearchFilters, 'userId'>
  ): Promise<PaginatedLikeResult> {
    return this.findAll({
      ...filters,
      userId,
    });
  }

  async findByTarget(
    targetId: string,
    targetType: LikeTarget,
    filters?: Omit<LikeSearchFilters, 'targetId' | 'targetType'>
  ): Promise<PaginatedLikeResult> {
    return this.findAll({
      ...filters,
      targetId,
      targetType,
    });
  }

  async findUserLikeOnTarget(
    userId: string,
    targetId: string,
    targetType: LikeTarget
  ): Promise<Like | null> {
    const model = await prismaClient.like.findUnique({
      where: {
        unique_user_like: {
          userId,
          targetId,
          targetType,
        },
      },
    });

    return model ? LikePrismaModelToEntityMapper.map(model) : null;
  }

  async count(filters?: Partial<LikeSearchFilters>): Promise<number> {
    const where: any = {};

    if (filters?.targetId) where.targetId = filters.targetId;
    if (filters?.targetType) where.targetType = filters.targetType;
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.isLike !== undefined) where.isLike = filters.isLike;

    return prismaClient.like.count({ where });
  }

  async countByTarget(
    targetId: string,
    targetType: LikeTarget,
    isLike?: boolean
  ): Promise<number> {
    const where: any = {
      targetId,
      targetType,
    };

    if (isLike !== undefined) {
      where.isLike = isLike;
    }

    return prismaClient.like.count({ where });
  }

  async countByUser(userId: string, isLike?: boolean): Promise<number> {
    const where: any = { userId };

    if (isLike !== undefined) {
      where.isLike = isLike;
    }

    return prismaClient.like.count({ where });
  }

  async getLikeCounts(
    targetId: string,
    targetType: LikeTarget,
    currentUserId?: string
  ): Promise<LikeCounts> {
    const [likesCount, dislikesCount, currentUserLike] = await Promise.all([
      this.countByTarget(targetId, targetType, true),
      this.countByTarget(targetId, targetType, false),
      currentUserId ? this.findUserLikeOnTarget(currentUserId, targetId, targetType) : null,
    ]);

    const netLikes = likesCount - dislikesCount;

    let currentUserLikeStatus: 'LIKE' | 'DISLIKE' | null = null;
    if (currentUserLike) {
      currentUserLikeStatus = currentUserLike.getIsLike() ? 'LIKE' : 'DISLIKE';
    }

    return {
      likesCount,
      dislikesCount,
      netLikes,
      currentUserLike: currentUserLikeStatus,
    };
  }

  async getStatistics(
    targetId?: string,
    targetType?: LikeTarget
  ): Promise<LikeStatistics> {
    const baseWhere: any = {};
    if (targetId) baseWhere.targetId = targetId;
    if (targetType) baseWhere.targetType = targetType;

    const [
      totalLikes,
      totalDislikes,
      topLikedTargetsData,
      topLikersData,
    ] = await Promise.all([
      prismaClient.like.count({ where: { ...baseWhere, isLike: true } }),
      prismaClient.like.count({ where: { ...baseWhere, isLike: false } }),
      this.getTopLikedTargetsData(targetType, 10),
      this.getTopLikersData(targetType, 10),
    ]);

    const likesCount = totalLikes;
    const dislikesCount = totalDislikes;
    const netLikes = likesCount - dislikesCount;
    const likeRatio = (likesCount + dislikesCount) > 0 ? likesCount / (likesCount + dislikesCount) : 0;

    return {
      totalLikes,
      totalDislikes,
      likesCount,
      dislikesCount,
      netLikes,
      likeRatio,
      topLikedTargets: topLikedTargetsData,
      topLikers: topLikersData,
    };
  }

  async toggleLike(
    userId: string,
    targetId: string,
    targetType: LikeTarget
  ): Promise<'CREATED' | 'UPDATED' | 'REMOVED'> {
    const existingLike = await this.findUserLikeOnTarget(userId, targetId, targetType);

    if (!existingLike) {
      const like = Like.create({
        userId,
        targetId,
        targetType,
        isLike: true,
      });
      await this.create(like);
      return 'CREATED';
    } else {
      if (existingLike.getIsLike()) {
        await this.delete(existingLike.getId());
        return 'REMOVED';
      } else {
        existingLike.toggleLike();
        await this.update(existingLike);
        return 'UPDATED';
      }
    }
  }

  async removeLike(
    userId: string,
    targetId: string,
    targetType: LikeTarget
  ): Promise<boolean> {
    const existingLike = await this.findUserLikeOnTarget(userId, targetId, targetType);
    
    if (existingLike) {
      await this.delete(existingLike.getId());
      return true;
    }
    
    return false;
  }

  // ✅ SUBSTITUIR O MÉTODO updateTargetLikeCounts (linha ~320)
async updateTargetLikeCounts(targetId: string, targetType: LikeTarget): Promise<void> {
  const likeCounts = await this.getLikeCounts(targetId, targetType);

  try {
    switch (targetType) {
      case 'ARTICLE':
        await prismaClient.article.update({
          where: { id: targetId },
          data: {
            likesCount: likeCounts.likesCount,        // ✅ CORRIGIDO
            dislikesCount: likeCounts.dislikesCount,  // ✅ CORRIGIDO
            updatedAt: new Date(),
          },
        });
        break;

      case 'PROJECT':
        await prismaClient.project.update({
          where: { id: targetId },
          data: {
            likesCount: likeCounts.likesCount,
            dislikesCount: likeCounts.dislikesCount,
            updatedAt: new Date(),
          },
        });
        break;

      case 'COMMENT':
        await prismaClient.comment.update({
          where: { id: targetId },
          data: {
            likesCount: likeCounts.likesCount,
            dislikesCount: likeCounts.dislikesCount,
            updatedAt: new Date(),
          },
        });
        break;

      case 'USER_PROFILE':
        // ✅ NOVO: Para likes em perfil de usuário (futuro)
        console.log(`[LikePrismaRepository] USER_PROFILE likes not implemented for targetId: ${targetId}`);
        break;

      default:
        console.warn(`[LikePrismaRepository] Unsupported targetType for like count update: ${targetType}`);
        break;
    }

    console.log(`✅ [LikePrismaRepository] Updated ${targetType} ${targetId} like counts: ${likeCounts.likesCount}👍 ${likeCounts.dislikesCount}👎`);
    
  } catch (error) {
    console.error(`❌ [LikePrismaRepository] Error updating ${targetType} ${targetId} like counts:`, error);
    
    // ✅ ADICIONAR: Log mais detalhado do erro
    if (error.code === 'P2025') {
      console.error(`❌ [LikePrismaRepository] Target ${targetType} with id ${targetId} not found`);
    } else if (error.code === 'P2002') {
      console.error(`❌ [LikePrismaRepository] Unique constraint violation for ${targetType} ${targetId}`);
    }
    
    throw error;
  }
}


  async exists(
    userId: string,
    targetId: string,
    targetType: LikeTarget
  ): Promise<boolean> {
    const count = await prismaClient.like.count({
      where: {
        userId,
        targetId,
        targetType,
      },
    });
    return count > 0;
  }

  async canUserLike(
    userId: string,
    targetId: string,
    targetType: LikeTarget
  ): Promise<boolean> {
    // Verificar se usuário existe e está ativo
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { isActive: true },
    });

    if (!user || !user.isActive) {
      return false;
    }

    // Verificar regras específicas por tipo de entidade
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
          select: { status: true },
        });
        return project?.status === 'APPROVED';

      case 'COMMENT':
        const comment = await prismaClient.comment.findUnique({
          where: { id: targetId },
          select: { approved: true, isDeleted: true },
        });
        return comment?.approved === true && comment?.isDeleted === false;

      case 'USER_PROFILE':
        const targetUser = await prismaClient.user.findUnique({
          where: { id: targetId },
          select: { isActive: true },
        });
        return targetUser?.isActive === true && targetId !== userId; // Não pode curtir a si mesmo

      default:
        return true;
    }
  }

  // ✅ CORRIGIDO: Método getMostLikedTargets com targetType
  async getMostLikedTargets(
    targetType: LikeTarget,
    limit: number,
    timeRange?: { start: Date; end: Date }
  ): Promise<Array<{
    targetId: string;
    targetType: LikeTarget; // ✅ ADICIONADO
    targetTitle: string;
    likesCount: number;
    dislikesCount: number;
    netLikes: number;
  }>> {
    const where: any = {
      targetType,
      isLike: true,
    };

    if (timeRange) {
      where.createdAt = {
        gte: timeRange.start,
        lte: timeRange.end,
      };
    }

    const results = await prismaClient.like.groupBy({
      by: ['targetId'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    // Buscar títulos e contabilizar dislikes
    const enrichedResults = await Promise.all(
      results.map(async (result) => {
        const [targetTitle, dislikesCount] = await Promise.all([
          this.getTargetTitle(result.targetId, targetType),
          this.countByTarget(result.targetId, targetType, false),
        ]);

        return {
          targetId: result.targetId,
          targetType, // ✅ ADICIONADO: incluir targetType no retorno
          targetTitle,
          likesCount: result._count.id,
          dislikesCount,
          netLikes: result._count.id - dislikesCount,
        };
      })
    );

    return enrichedResults;
  }

  // Métodos auxiliares privados
  private async getTopLikedTargetsData(targetType?: LikeTarget, limit = 10) {
    if (!targetType) return [];
    return this.getMostLikedTargets(targetType, limit);
  }

  private async getTopLikersData(targetType?: LikeTarget, limit = 10) {
    return this.getMostActiveLikers(limit, targetType);
  }

  private async getTargetTitle(targetId: string, targetType: LikeTarget): Promise<string> {
    switch (targetType) {
      case 'ARTICLE':
        const article = await prismaClient.article.findUnique({
          where: { id: targetId },
          select: { titulo: true },
        });
        return article?.titulo || 'Unknown Article';

      case 'PROJECT':
        const project = await prismaClient.project.findUnique({
          where: { id: targetId },
          select: { name: true },
        });
        return project?.name || 'Unknown Project';

      case 'COMMENT':
        const comment = await prismaClient.comment.findUnique({
          where: { id: targetId },
          select: { content: true },
        });
        return comment?.content?.substring(0, 50) + '...' || 'Unknown Comment';

      case 'USER_PROFILE':
        const user = await prismaClient.user.findUnique({
          where: { id: targetId },
          select: { name: true },
        });
        return user?.name || 'Unknown User';

      default:
        return 'Unknown';
    }
  }
}
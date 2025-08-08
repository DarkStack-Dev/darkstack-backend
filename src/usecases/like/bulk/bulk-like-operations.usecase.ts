// 4. ✅ BULK OPERATIONS
// src/usecases/like/bulk/bulk-like-operations.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { LikeGatewayRepository } from '@/domain/repositories/like/like.gateway.repository';
import { NotificationGateway } from '@/infra/websocket/notification.gateway';
import { LikeTarget } from '@/domain/entities/like/like.entity';

export type BulkLikeOperationsInput = {
  userId: string;
  operations: Array<{
    targetId: string;
    targetType: LikeTarget;
    action: 'LIKE' | 'DISLIKE' | 'REMOVE';
  }>;
};

export type BulkLikeOperationsOutput = {
  results: Array<{
    targetId: string;
    targetType: LikeTarget;
    action: 'LIKE' | 'DISLIKE' | 'REMOVE';
    success: boolean;
    error?: string;
    likeCounts?: {
      likesCount: number;
      dislikesCount: number;
      netLikes: number;
    };
  }>;
  summary: {
    totalRequested: number;
    successful: number;
    failed: number;
    executionTime: number;
  };
};

@Injectable()
export class BulkLikeOperationsUsecase implements Usecase<BulkLikeOperationsInput, BulkLikeOperationsOutput> {
  constructor(
    private readonly likeRepository: LikeGatewayRepository,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async execute(input: BulkLikeOperationsInput): Promise<BulkLikeOperationsOutput> {
    const startTime = Date.now();
    const results: BulkLikeOperationsOutput['results'] = [];

    // Processar operações em lotes para evitar sobrecarga
    const batchSize = 10;
    for (let i = 0; i < input.operations.length; i += batchSize) {
      const batch = input.operations.slice(i, i + batchSize);
      
      const batchResults = await Promise.allSettled(
        batch.map(operation => this.processOperation(input.userId, operation))
      );

      // Processar resultados do lote
      batchResults.forEach((result, index) => {
        const operation = batch[index];
        
        if (result.status === 'fulfilled') {
          results.push({
            targetId: operation.targetId,
            targetType: operation.targetType,
            action: operation.action,
            success: true,
            likeCounts: result.value,
          });
        } else {
          results.push({
            targetId: operation.targetId,
            targetType: operation.targetType,
            action: operation.action,
            success: false,
            error: result.reason?.message || 'Unknown error',
          });
        }
      });
    }

    // Broadcast updates em lote
    await this.broadcastBulkUpdates(results);

    const endTime = Date.now();
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return {
      results,
      summary: {
        totalRequested: input.operations.length,
        successful,
        failed,
        executionTime: endTime - startTime,
      },
    };
  }

  private async processOperation(
    userId: string,
    operation: { targetId: string; targetType: LikeTarget; action: 'LIKE' | 'DISLIKE' | 'REMOVE' }
  ) {
    switch (operation.action) {
      case 'LIKE':
        await this.likeRepository.toggleLike(userId, operation.targetId, operation.targetType);
        break;
      case 'DISLIKE':
        // Implementar toggle dislike
        break;
      case 'REMOVE':
        await this.likeRepository.removeLike(userId, operation.targetId, operation.targetType);
        break;
    }

    // Atualizar contadores
    await this.likeRepository.updateTargetLikeCounts(operation.targetId, operation.targetType);
    
    // Retornar contadores atualizados
    return this.likeRepository.getLikeCounts(operation.targetId, operation.targetType);
  }

  private async broadcastBulkUpdates(results: BulkLikeOperationsOutput['results']) {
    // Agrupar por entidade para fazer broadcast eficiente
    const updates = new Map<string, any>();
    
    results.forEach(result => {
      if (result.success && result.likeCounts) {
        const key = `${result.targetType}_${result.targetId}`;
        updates.set(key, {
          targetId: result.targetId,
          targetType: result.targetType,
          likeCounts: result.likeCounts,
          action: 'BULK_UPDATE',
        });
      }
    });

    // Broadcast updates
    updates.forEach(update => {
      this.notificationGateway.broadcastLikeUpdate(
        update.targetType,
        update.targetId,
        update
      );
    });
  }
}
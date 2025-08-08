// src/usecases/like/toggle/toggle-like.usecase.ts
import { Injectable } from '@nestjs/common';
import { Usecase } from '@/usecases/usecase';
import { 
  ToggleLikeUseCase as DomainToggleLikeUseCase,
  ToggleLikeOutput as DomainToggleLikeOutput
} from '@/domain/usecases/like/toggle/toggle-like.usecase';
import { NotificationGateway } from '@/infra/websocket/notification.gateway';
import { NotificationStreamService } from '@/infra/services/notification/notification-stream.service';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { LikeTarget } from '@/domain/entities/like/like.entity';
import { UserNotFoundUsecaseException } from '@/usecases/exceptions/user/user-not-found.usecase.exception';
import { InvalidInputUsecaseException } from '@/usecases/exceptions/input/invalid-input.usecase.exception';
import { TargetNotFoundUsecaseException } from '@/usecases/exceptions/like/target-not-found.usecase.exception';

export type ToggleLikeInput = {
  userId: string;
  targetId: string;
  targetType: LikeTarget;
  isLike?: boolean; // true = like, false = dislike, undefined = toggle
};

export type ToggleLikeOutput = {
  id?: string;
  userId: string;
  targetId: string;
  targetType: LikeTarget;
  isLike?: boolean;
  action: 'CREATED' | 'UPDATED' | 'REMOVED';
  likeCounts: {
    likesCount: number;
    dislikesCount: number;
    netLikes: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
  // ✅ Application layer properties
  realTimeBroadcast: boolean;
  notificationsSent: number;
};

@Injectable()
export class ToggleLikeUsecase implements Usecase<ToggleLikeInput, ToggleLikeOutput> {
  constructor(
    private readonly domainToggleLikeUseCase: DomainToggleLikeUseCase,
    private readonly notificationGateway: NotificationGateway,
    private readonly notificationStreamService: NotificationStreamService,
    private readonly userRepository: UserGatewayRepository,
  ) {}

  async execute(input: ToggleLikeInput): Promise<ToggleLikeOutput> {
    try {
      // 1. Delegar para Domain Use Case
      const domainOutput: DomainToggleLikeOutput = await this.domainToggleLikeUseCase.execute(input);

      // 2. Ações de WebSocket e notificações
      const results = await this.handleLikeActions(domainOutput, input);

      // 3. Mapear Domain Output → Application Output
      return {
        ...domainOutput,
        realTimeBroadcast: results.realTimeBroadcast,
        notificationsSent: results.notificationsSent,
      };

    } catch (error) {
      this.handleDomainExceptions(error);
      throw error;
    }
  }

  private async handleLikeActions(
    domainOutput: DomainToggleLikeOutput,
    input: ToggleLikeInput
  ): Promise<{ realTimeBroadcast: boolean; notificationsSent: number }> {
    let realTimeBroadcast = false;
    let notificationsSent = 0;

    try {
      // 🚀 1. BROADCAST EM TEMPO REAL VIA WEBSOCKET
      realTimeBroadcast = await this.broadcastLikeUpdate(domainOutput, input);

      // 🔔 2. NOTIFICAR DONO DA ENTIDADE (se criou/atualizou)
      if (domainOutput.action === 'CREATED' || domainOutput.action === 'UPDATED') {
        const ownerNotified = await this.notifyTargetOwner(domainOutput, input);
        if (ownerNotified) notificationsSent++;
      }

    } catch (error) {
      console.error('Error in post-like actions:', error);
    }

    return { realTimeBroadcast, notificationsSent };
  }

  private async broadcastLikeUpdate(
    domainOutput: DomainToggleLikeOutput,
    input: ToggleLikeInput
  ): Promise<boolean> {
    try {
      // Buscar dados do usuário para incluir no broadcast
      const user = await this.userRepository.findById(input.userId);
      
      const likeData = {
        id: domainOutput.id,
        userId: domainOutput.userId,
        user: user ? {
          id: user.getId(),
          name: user.getName(),
          email: user.getEmail(),
          avatar: user.getAvatar(),
        } : null,
        targetId: domainOutput.targetId,
        targetType: domainOutput.targetType,
        isLike: domainOutput.isLike,
        action: domainOutput.action,
        likeCounts: domainOutput.likeCounts,
        createdAt: domainOutput.createdAt,
        updatedAt: domainOutput.updatedAt,
      };

      // 🚀 BROADCAST VIA WEBSOCKET
      const webSocketBroadcast = this.notificationGateway.broadcastLikeUpdate(
        input.targetType,
        input.targetId,
        likeData
      );

      // 📡 BROADCAST VIA SSE (fallback)
      this.notificationStreamService.broadcastToChannel(
        `${input.targetType.toLowerCase()}_${input.targetId}`,
        {
          type: 'LIKE_UPDATE',
          like: likeData,
        }
      );

      console.log(`✅ [ToggleLikeUsecase] Real-time broadcast: WebSocket=${webSocketBroadcast} users`);
      return webSocketBroadcast > 0;

    } catch (error) {
      console.error('❌ [ToggleLikeUsecase] Error broadcasting like update:', error);
      return false;
    }
  }

  private async notifyTargetOwner(
    domainOutput: DomainToggleLikeOutput,
    input: ToggleLikeInput
  ): Promise<boolean> {
    try {
      let targetOwnerId: string | null = null;
      let targetTitle = '';

      // Não implementar notificação para USER_PROFILE (seria notificar o próprio usuário)
      if (input.targetType === 'USER_PROFILE') {
        return false;
      }

      // Buscar owner da entidade alvo
      // Esta lógica seria implementada com repositories específicos
      // Por simplicidade, retornando false por enquanto
      
      // TODO: Implementar busca de owner por tipo de entidade
      console.log(`📬 [ToggleLikeUsecase] Target owner notification not implemented for ${input.targetType}`);
      return false;

    } catch (error) {
      console.error('❌ [ToggleLikeUsecase] Error notifying target owner:', error);
      return false;
    }
  }

  private handleDomainExceptions(error: any): void {
    if (error instanceof UserNotFoundUsecaseException) {
      throw new UserNotFoundUsecaseException(
        error.getInternalMessage?.() || `User not found in ${ToggleLikeUsecase.name}`,
        error.getExternalMessage?.() || 'Usuário não encontrado',
        ToggleLikeUsecase.name,
      );
    }

    if (error instanceof InvalidInputUsecaseException) {
      throw new InvalidInputUsecaseException(
        error.getInternalMessage?.() || `Invalid input in ${ToggleLikeUsecase.name}`,
        error.getExternalMessage?.() || 'Dados inválidos',
        ToggleLikeUsecase.name,
      );
    }

    if (error instanceof TargetNotFoundUsecaseException) {
      throw new TargetNotFoundUsecaseException(
        error.getInternalMessage?.() || `Target not found in ${ToggleLikeUsecase.name}`,
        error.getExternalMessage?.() || 'Entidade não encontrada',
        ToggleLikeUsecase.name,
      );
    }
  }
}
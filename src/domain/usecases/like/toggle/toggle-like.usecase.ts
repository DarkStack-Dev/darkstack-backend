// src/domain/usecases/like/toggle/toggle-like.usecase.ts
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { Like, LikeTarget } from '@/domain/entities/like/like.entity';
import { LikeGatewayRepository } from '@/domain/repositories/like/like.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { ArticleGatewayRepository } from '@/domain/repositories/article/article.gateway.repository';
import { ProjectsGatewayRepository } from '@/domain/repositories/projects/projects.gateway.repository';
import { CommentGatewayRepository } from '@/domain/repositories/comment/comment.gateway.repository';
import { UserNotFoundUsecaseException } from '../../exceptions/user/user-not-found.usecase.exception';
import { InvalidInputUsecaseException } from '../../exceptions/input/invalid-input.usecase.exception';

export type ToggleLikeInput = {
  userId: string;
  targetId: string;
  targetType: LikeTarget;
  isLike?: boolean; // true = like, false = dislike, undefined = toggle
};

export type ToggleLikeOutput = {
  id?: string; // undefined se foi removido
  userId: string;
  targetId: string;
  targetType: LikeTarget;
  isLike?: boolean; // undefined se foi removido
  action: 'CREATED' | 'UPDATED' | 'REMOVED';
  likeCounts: {
    likesCount: number;
    dislikesCount: number;
    netLikes: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export class ToggleLikeUseCase implements UseCase<ToggleLikeInput, ToggleLikeOutput> {
  constructor(
    private readonly likeRepository: LikeGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
    private readonly articleRepository: ArticleGatewayRepository,
    private readonly projectsRepository: ProjectsGatewayRepository,
    private readonly commentRepository: CommentGatewayRepository,
  ) {}

  async execute(input: ToggleLikeInput): Promise<ToggleLikeOutput> {
    // 1. Validar entrada
    this.validateInput(input);

    // 2. Verificar se usuário existe
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new UserNotFoundUsecaseException(
        `User not found with id ${input.userId}`,
        'Usuário não encontrado',
        ToggleLikeUseCase.name,
      );
    }

    // 3. Verificar se entidade alvo existe
    await this.validateTarget(input.targetId, input.targetType);

    // 4. Verificar se usuário pode dar like
    const canLike = await this.likeRepository.canUserLike(
      input.userId,
      input.targetId,
      input.targetType
    );
    if (!canLike) {
      throw new InvalidInputUsecaseException(
        'User cannot like this target',
        'Usuário não pode curtir esta entidade',
        ToggleLikeUseCase.name,
      );
    }

    // 5. Buscar like existente
    const existingLike = await this.likeRepository.findUserLikeOnTarget(
      input.userId,
      input.targetId,
      input.targetType
    );

    let resultLike: Like | null = null;
    let action: 'CREATED' | 'UPDATED' | 'REMOVED';

    if (!existingLike) {
      // 6a. Criar novo like
      resultLike = Like.create({
        userId: input.userId,
        targetId: input.targetId,
        targetType: input.targetType,
        isLike: input.isLike !== undefined ? input.isLike : true, // Default: like
      });

      await this.likeRepository.create(resultLike);
      action = 'CREATED';

    } else {
      // 6b. Like já existe - decidir ação
      if (input.isLike === undefined) {
        // Toggle: se mesmo tipo, remove; se diferente, atualiza
        if (existingLike.getIsLike() === true) {
          // Usuário clicou em like novamente -> remover
          await this.likeRepository.delete(existingLike.getId());
          action = 'REMOVED';
        } else {
          // Era dislike, virou like
          existingLike.toggleLike();
          await this.likeRepository.update(existingLike);
          resultLike = existingLike;
          action = 'UPDATED';
        }
      } else {
        // Tipo específico solicitado
        if (existingLike.getIsLike() === input.isLike) {
          // Mesmo tipo -> remover
          await this.likeRepository.delete(existingLike.getId());
          action = 'REMOVED';
        } else {
          // Tipo diferente -> atualizar
          if (input.isLike) {
            existingLike.toggleLike();
          } else {
            existingLike.toggleDislike();
          }
          await this.likeRepository.update(existingLike);
          resultLike = existingLike;
          action = 'UPDATED';
        }
      }
    }

    // 7. Atualizar contadores na entidade alvo
    await this.likeRepository.updateTargetLikeCounts(input.targetId, input.targetType);

    // 8. Buscar contadores atualizados
    const likeCounts = await this.likeRepository.getLikeCounts(
      input.targetId,
      input.targetType
    );

    return {
      id: resultLike?.getId(),
      userId: input.userId,
      targetId: input.targetId,
      targetType: input.targetType,
      isLike: resultLike?.getIsLike(),
      action,
      likeCounts: {
        likesCount: likeCounts.likesCount,
        dislikesCount: likeCounts.dislikesCount,
        netLikes: likeCounts.netLikes,
      },
      createdAt: resultLike?.getCreatedAt(),
      updatedAt: resultLike?.getUpdatedAt(),
    };
  }

  private validateInput(input: ToggleLikeInput): void {
    if (!['ARTICLE', 'PROJECT', 'COMMENT', 'USER_PROFILE', 'ISSUE', 'QA'].includes(input.targetType)) {
      throw new InvalidInputUsecaseException(
        'Invalid target type',
        'Tipo de entidade inválido',
        ToggleLikeUseCase.name,
      );
    }
  }

  private async validateTarget(targetId: string, targetType: LikeTarget): Promise<void> {
    switch (targetType) {
      case 'ARTICLE':
        const article = await this.articleRepository.findById(targetId);
        if (!article) {
          throw new InvalidInputUsecaseException(
            `Article not found with id ${targetId}`,
            'Artigo não encontrado',
            ToggleLikeUseCase.name,
          );
        }
        break;

      case 'PROJECT':
        const project = await this.projectsRepository.findById(targetId);
        if (!project) {
          throw new InvalidInputUsecaseException(
            `Project not found with id ${targetId}`,
            'Projeto não encontrado',
            ToggleLikeUseCase.name,
          );
        }
        break;

      case 'COMMENT':
        const comment = await this.commentRepository.findById(targetId);
        if (!comment) {
          throw new InvalidInputUsecaseException(
            `Comment not found with id ${targetId}`,
            'Comentário não encontrado',
            ToggleLikeUseCase.name,
          );
        }
        break;

      case 'USER_PROFILE':
        const user = await this.userRepository.findById(targetId);
        if (!user) {
          throw new InvalidInputUsecaseException(
            `User not found with id ${targetId}`,
            'Usuário não encontrado',
            ToggleLikeUseCase.name,
          );
        }
        break;

      default:
        throw new InvalidInputUsecaseException(
          `Unsupported target type: ${targetType}`,
          'Tipo de entidade não suportado',
          ToggleLikeUseCase.name,
        );
    }
  }
}

// src/domain/validators/like/like.zod.validator.ts
import { z } from 'zod';
import { Validator } from '@/domain/shared/validators/validator';
import { Like } from '@/domain/entities/like/like.entity';
import { ValidatorDomainException } from '@/domain/shared/exceptions/validator-domain.exception';

const likeSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid('ID do usuário deve ser um UUID válido'),
  targetId: z.string().uuid('ID da entidade deve ser um UUID válido'),
  targetType: z.enum(['ARTICLE', 'PROJECT', 'COMMENT', 'USER_PROFILE', 'ISSUE', 'QA'], {
    errorMap: () => ({ message: 'Tipo de like deve ser ARTICLE, PROJECT, COMMENT, USER_PROFILE, ISSUE ou QA' }),
  }),
  isLike: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export class LikeZodValidator implements Validator<Like> {
  public validate(entity: Like): void {
    try {
      likeSchema.parse({
        id: entity.getId(),
        userId: entity.getUserId(),
        targetId: entity.getTargetId(),
        targetType: entity.getTargetType(),
        isLike: entity.getIsLike(),
        createdAt: entity.getCreatedAt(),
        updatedAt: entity.getUpdatedAt(),
      });

      this.validateBusinessRules(entity);

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        throw new ValidatorDomainException(
          `Like validation failed: ${errorMessages.join(', ')}`,
          errorMessages.join(', '),
          LikeZodValidator.name,
        );
      }
      throw error;
    }
  }

  private validateBusinessRules(entity: Like): void {
    // 🚫 Não pode dar like em si mesmo (se for USER_PROFILE)
    if (entity.getTargetType() === 'USER_PROFILE' && entity.getTargetId() === entity.getUserId()) {
      throw new ValidatorDomainException(
        'User cannot like their own profile',
        'Usuário não pode curtir o próprio perfil',
        LikeZodValidator.name,
      );
    }

    // ✅ Outras validações de negócio podem ser adicionadas aqui
  }
}
// src/domain/validators/comment/comment.zod.validator.ts
import { z } from 'zod';
import { Validator } from '@/domain/shared/validators/validator';
import { Comment } from '@/domain/entities/comment/comment.entity';
import { ValidatorDomainException } from '@/domain/shared/exceptions/validator-domain.exception';

const commentSchema = z.object({
  id: z.string().uuid().optional(),
  content: z
    .string()
    .min(1, 'Conteúdo é obrigatório')
    .min(3, 'Comentário deve ter pelo menos 3 caracteres')
    .max(2000, 'Comentário deve ter no máximo 2000 caracteres')
    .refine(
      (content) => content.trim().length >= 3,
      'Comentário deve ter pelo menos 3 caracteres válidos'
    ),
  isEdited: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
  authorId: z.string().uuid('ID do autor deve ser um UUID válido'),
  parentId: z.string().uuid('ID do comentário pai deve ser um UUID válido').optional().nullable(),
  repliesCount: z.number().int().min(0, 'Número de respostas deve ser positivo').optional(),
  targetId: z.string().uuid('ID da entidade deve ser um UUID válido'),
  targetType: z.enum(['ARTICLE', 'PROJECT', 'ISSUE', 'QA'], {
    errorMap: () => ({ message: 'Tipo de comentário deve ser ARTICLE, PROJECT, ISSUE ou QA' }),
  }),
  approved: z.boolean().optional(),
  approvedById: z.string().uuid('ID do moderador deve ser um UUID válido').optional().nullable(),
  approvedAt: z.date().optional().nullable(),
  rejectionReason: z
    .string()
    .max(500, 'Motivo da rejeição deve ter no máximo 500 caracteres')
    .optional()
    .nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export class CommentZodValidator extends Validator<Comment> {
  public validate(entity: Comment): void {
    try {
      commentSchema.parse({
        id: entity.getId(),
        content: entity.getContent(),
        isEdited: entity.getIsEdited(),
        isDeleted: entity.getIsDeleted(),
        authorId: entity.getAuthorId(),
        parentId: entity.getParentId(),
        repliesCount: entity.getRepliesCount(),
        targetId: entity.getTargetId(),
        targetType: entity.getTargetType(),
        approved: entity.getApproved(),
        approvedById: entity.getApprovedById(),
        approvedAt: entity.getApprovedAt(),
        rejectionReason: entity.getRejectionReason(),
        createdAt: entity.getCreatedAt(),
        updatedAt: entity.getUpdatedAt(),
      });

      // 🔍 Validações de negócio específicas
      this.validateBusinessRules(entity);

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        throw new ValidatorDomainException(
          `Comment validation failed: ${errorMessages.join(', ')}`,
          errorMessages.join(', '),
          CommentZodValidator.name,
        );
      }
      throw error;
    }
  }

  private validateBusinessRules(entity: Comment): void {
    // 🚫 Comentário deletado não pode ter conteúdo válido
    if (entity.getIsDeleted() && entity.getContent() !== '[Comentário removido]') {
      throw new ValidatorDomainException(
        'Deleted comment must have placeholder content',
        'Comentário deletado deve ter conteúdo de placeholder',
        CommentZodValidator.name,
      );
    }

    // 🚫 Comentário rejeitado deve ter motivo
    if (entity.getApproved() === false && !entity.getRejectionReason()) {
      throw new ValidatorDomainException(
        'Rejected comment must have rejection reason',
        'Comentário rejeitado deve ter motivo da rejeição',
        CommentZodValidator.name,
      );
    }

    // 🚫 Comentário aprovado deve ter moderador e data
    if (entity.getApproved() === true && entity.getApprovedById() && !entity.getApprovedAt()) {
      throw new ValidatorDomainException(
        'Approved comment must have approval date',
        'Comentário aprovado deve ter data de aprovação',
        CommentZodValidator.name,
      );
    }

    // 🚫 Conteúdo vazio após trim
    const trimmedContent = entity.getContent().trim();
    if (!entity.getIsDeleted() && trimmedContent.length === 0) {
      throw new ValidatorDomainException(
        'Comment content cannot be empty after trimming',
        'Conteúdo do comentário não pode estar vazio',
        CommentZodValidator.name,
      );
    }

    // 🚫 Validar número de respostas
    if (entity.getRepliesCount() < 0) {
      throw new ValidatorDomainException(
        'Replies count cannot be negative',
        'Número de respostas não pode ser negativo',
        CommentZodValidator.name,
      );
    }
  }
}
// src/domain/validators/notification/notification.zod.validator.ts
import { z } from "zod";
import { Validator } from "@/domain/shared/validators/validator";
import { Notification } from "@/domain/entities/notification/notification.entity";
import { ZodUtils } from "@/shared/utils/zod-utils";
import { ValidatorDomainException } from "@/domain/shared/exceptions/validator-domain.exception";
import { DomainException } from "@/domain/shared/exceptions/domain.exception";
import { NotificationType } from "generated/prisma";

export class NotificationZodValidator implements Validator<Notification> {
  private constructor() {}

  public static create(): NotificationZodValidator {
    return new NotificationZodValidator();
  }

  public validate(input: Notification): void {
    try {
      this.getZodSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = ZodUtils.formatZodError(error);
        throw new ValidatorDomainException(
          `Error validating Notification ${input.getId()}: ${message}`,
          `Dados inválidos para notificação: ${message}`,
          NotificationZodValidator.name
        );
      }
      
      const err = error as Error;
      throw new DomainException(
        `Error validating Notification ${input.getId()}: ${err.message}`,
        `Erro inesperado ao validar notificação: ${err.message}`,
        NotificationZodValidator.name
      );
    }
  }

  private getZodSchema() {
    return z.object({
      id: z.string().uuid("ID da notificação inválido"),
      type: z.nativeEnum(NotificationType, {
        errorMap: () => ({ message: "Tipo de notificação inválido" })
      }),
      title: z.string()
        .min(1, "Título é obrigatório")
        .max(200, "Título não pode exceder 200 caracteres")
        .trim(),
      message: z.string()
        .min(1, "Mensagem é obrigatória")
        .max(1000, "Mensagem não pode exceder 1000 caracteres")
        .trim(),
      isRead: z.boolean(),
      userId: z.string().uuid("ID do usuário inválido"),
      relatedId: z.string().uuid("ID relacionado inválido").nullish(),
      relatedType: z.string()
        .regex(/^(ARTICLE|PROJECT)$/, "Tipo relacionado deve ser ARTICLE ou PROJECT")
        .nullish(),
      metadata: z.any().nullish(),
      createdById: z.string().uuid("ID do criador inválido").nullish(),
      readAt: z.date().nullish(),
      createdAt: z.date(),
      updatedAt: z.date(),
      deletedAt: z.date().nullish(),
    })
    .refine((data) => {
      // Se tem relatedId, deve ter relatedType e vice-versa
      if (data.relatedId && !data.relatedType) return false;
      if (data.relatedType && !data.relatedId) return false;
      return true;
    }, {
      message: "Se há ID relacionado, deve haver tipo relacionado e vice-versa",
      path: ["relatedId", "relatedType"]
    })
    .refine((data) => {
      // Se está lida, deve ter readAt
      if (data.isRead && !data.readAt) return false;
      return true;
    }, {
      message: "Notificações lidas devem ter data de leitura",
      path: ["readAt"]
    })
    .refine((data) => {
      // readAt deve ser posterior ao createdAt
      if (data.readAt && data.createdAt && data.readAt < data.createdAt) {
        return false;
      }
      return true;
    }, {
      message: "Data de leitura deve ser posterior à data de criação",
      path: ["readAt"]
    });
  }
}
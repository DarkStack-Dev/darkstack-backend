// src/domain/factories/notification/notification.validator.factory.ts
import { Validator } from "@/domain/shared/validators/validator";
import { NotificationZodValidator } from "@/domain/validators/notification/notification.zod.validator";
import { Notification } from "@/domain/entities/notification/notification.entity";

export class NotificationValidatorFactory {
  public static create(): Validator<Notification> {
    return NotificationZodValidator.create();
  }
}
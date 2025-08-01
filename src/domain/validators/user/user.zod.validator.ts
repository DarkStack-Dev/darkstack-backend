// src/domain/validators/user/user.zod.validator.ts - Corrigido para UUID

import { z } from "zod";
import { User } from "../../entities/user/user.entitty";
import { Validator } from "../../shared/validators/validator";
import { ZodUtils } from "../../../shared/utils/zod-utils";
import { ValidatorDomainException } from "../../shared/exceptions/validator-domain.exception";
import { DomainException } from "../../shared/exceptions/domain.exception";
import { UserRole } from "generated/prisma";

export class UserZodValidator implements Validator<User>{
  private constructor() {}

  public static create(): UserZodValidator{
    return new UserZodValidator();
  }

  public validate(input: User): void {
    try{
      this.getZodSchema().parse(input);
    }catch(error){
      if (error instanceof z.ZodError) {
        const message = ZodUtils.formatZodError(error);
        throw new ValidatorDomainException(
          `Error while validating User ${input.getId()}: ${message}`,
          `Os dados informados não são válidos para o usuário ${input.getId()}: ${message}`,
          UserZodValidator.name
        )
      }else{
        const err = error as Error;

        throw new DomainException(
          `Error while validating User ${input.getId()}: ${err.message}`,
          `Erro inesperado para validar os dados do usuário ${input.getId()}: ${err.message}`,
          UserZodValidator.name
        )
      }
    }
  }

  private getZodSchema() {
    const zodSchema = z.object({
      id: z.string().uuid("Invalid user ID format"), // ✅ Mudou de .uuid() para .uuid() (já estava correto)
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email format"),
      password: z.string(), // ✅ Permitir string vazia para OAuth
      roles: z.array(z.nativeEnum(UserRole)).nonempty("At least one role is required"),
      createdAt: z.date(),
      updatedAt: z.date()
    })

    return zodSchema;
  }
}
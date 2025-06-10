import { z } from "zod";
import { Validator } from "../shared/validators/validator";
import { UserZodValidator } from "./user.zod.validator";
import { ZodUtils } from "src/shared/utils/zod-utils";
import { ValidatorDomainException } from "../shared/exceptions/validator-domain.exception";
import { DomainException } from "../shared/exceptions/domain.exception";

export class UserPasswordZodValidator implements Validator<string>{

    private constructor() {}

    public static create(): UserPasswordZodValidator {
        return new UserPasswordZodValidator();
    }

    public validate(input: string): void {
        try{
          this.getZodSchema().parse(input);
        }catch(error){
          if (error instanceof z.ZodError) {
            const message = ZodUtils.formatZodError(error);
            throw new ValidatorDomainException(
              `Error while validating user password: ${message}`,
              `Senha inválida ${message}`,
              UserPasswordZodValidator.name
            )
          } 
          
          const err = error as Error;
    
          throw new DomainException(
            `Error while validating user password: ${err.message}`,
            `Houve um erro inesperado ao validar a senha do usuário: ${err.message}`,
            UserPasswordZodValidator.name
          )
        }
    }

    private getZodSchema() {
        const zodSchema = z.string().min(8, "Password must be at least 8 characters long");
        return zodSchema;
    }
}
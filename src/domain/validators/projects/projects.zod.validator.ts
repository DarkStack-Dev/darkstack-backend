import { z } from "zod";
import { User } from "../../entities/user/user.entitty";
import { Validator } from "../../shared/validators/validator";
import { ZodUtils } from "../../../shared/utils/zod-utils";
import { ValidatorDomainException } from "../../shared/exceptions/validator-domain.exception";
import { DomainException } from "../../shared/exceptions/domain.exception";
import { UserRole } from "generated/prisma";
import { Projects } from "@/domain/entities/projects/projects.entity";

export class ProjectsZodValidator implements Validator<Projects>{
  private constructor() {}

  public static create(): ProjectsZodValidator{
    return new ProjectsZodValidator();
  }

  public validate(input: Projects): void {
    try{
      this.getZodSchema().parse(input);
    }catch(error){
      if (error instanceof z.ZodError) {
        const message = ZodUtils.formatZodError(error);
        throw new ValidatorDomainException(
          `Error while validating Project ${input.getId()}: ${message}`,
          `Os dados informados não são válidos para o projeto ${input.getId()}: ${message}`,
          ProjectsZodValidator.name
        )
      }else{
        const err = error as Error;

        throw new DomainException(
          `Error while validating Project ${input.getId()}: ${err.message}`,
          `Erro inesperado para validar os dados do projeto ${input.getId()}: ${err.message}`,
          ProjectsZodValidator.name
        )
      }
    }
  }

  private getZodSchema() {
    const zodSchema = z.object({
      id: z.string().uuid(),
      name: z.string().min(1, "Name is required"),
      description: z.string().min(1, "Description is required"),
      imagesPath: z.array(z.string()).nonempty("At least one image path is required"),
      createdAt: z.date(),
      updatedAt: z.date(),
      isActive: z.boolean(),
    })

    return zodSchema;
  }
}
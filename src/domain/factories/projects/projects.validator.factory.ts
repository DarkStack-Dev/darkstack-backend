import { ProjectsZodValidator } from "@/domain/validators/projects/projects.zod.validator";
import { Validator } from "../../shared/validators/validator";
import { Projects } from "@/domain/entities/projects/projects.entity";

export class ProjectsValidatorFactory{
  public static create(): Validator<Projects>{
    return ProjectsZodValidator.create();
  }
}
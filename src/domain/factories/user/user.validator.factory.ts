import { User } from "../../entities/user/user.entitty";
import { Validator } from "../../shared/validators/validator";
import { UserZodValidator } from "../../validators/user/user.zod.validator";

export class UserValidatorFactory{
  public static create(): Validator<User>{
    return UserZodValidator.create();
  }
}
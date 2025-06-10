import { Utils } from "../../shared/utils/utils";
import { Entity } from "../shared/entities/entity";
import { UserValidatorFactory } from "../factories/user-validator.factory";

export type UserCreateDto = {
  email: string;
  password: string;
  name: string;
}

export class User extends Entity {
  private name: string;
  private email: string;
  private password: string;

  constructor(id: string, name: string, email: string, password: string, createdAt: Date, updatedAt: Date) {
    super(id, createdAt, updatedAt);
    this.name = name;
    this.email = email;
    this.password = password;
    this.validate();
  }

  public static create({email, password, name}: UserCreateDto): User {
    const id = Utils.GenerateUUID();
    const hashedPassword = Utils.encryptPassword(password);
    const createdAt = new Date();
    const updatedAt = new Date();
    return new User(id, name, email, hashedPassword, createdAt, updatedAt);
  }

  protected validate(): void {
    UserValidatorFactory.create().validate(this);
  }

  public getName(): string {
    return this.name;
  }

  public getEmail(): string {
    return this.email;
  }

  public getPassword(): string {
    return this.password;
  }

  public comparePassword(password: string): boolean {
    return Utils.comparePassword(password, this.password);
  }
}
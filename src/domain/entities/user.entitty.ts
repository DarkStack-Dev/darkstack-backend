import { Utils } from "../../shared/utils/utils";
import { Entity } from "../shared/entities/entity";
import { UserValidatorFactory } from "../factories/user.validator.factory";
import { UserPasswordValidatorFactory } from "../factories/user-password.validator.factory";
import { UserRole } from "generated/prisma";

// export enum UserRole {
//   ADMIN = 'admin',
//   USER = 'user',
//   MODERATOR = 'moderator',
//   GUEST = 'guest'
// }

export type UserCreateDto = {
  email: string;
  password: string;
  name: string;
  roles: UserRole[];
}

export type UserWithDto = {
  id: string;
  name: string;
  email: string;
  password: string;
  roles: UserRole[];
  createdAt: Date;
  updatedAt: Date;
};


export class User extends Entity {
  private name: string;
  private email: string;
  private password: string;
  private roles: UserRole[];  

  constructor(id: string, name: string, email: string, password: string, roles: UserRole[], createdAt: Date, updatedAt: Date) {
    super(id, createdAt, updatedAt);
    this.name = name;
    this.email = email;
    this.password = password;
    this.roles = roles;
    this.validate();
  }

  public static create({name, email, password, roles}: UserCreateDto): User {
    const id = Utils.GenerateUUID();

    UserPasswordValidatorFactory.create().validate(password);

    const hashedPassword = Utils.encryptPassword(password);
    const createdAt = new Date();
    const updatedAt = new Date();
    return new User(id, name, email, hashedPassword, roles, createdAt, updatedAt);
  }

  public static with({
    id,
    name,
    email,
    password,
    roles,
    createdAt,
    updatedAt,
  }: UserWithDto): User {
    return new User(id, name, email,  password, roles, createdAt, updatedAt);
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

  public getRoles(): UserRole[] {
    return this.roles;
  }

  public comparePassword(password: string): boolean {
    return Utils.comparePassword(password, this.password);
  }
}
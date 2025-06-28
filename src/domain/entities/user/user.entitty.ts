// import { Utils } from "../../../shared/utils/utils";
import {Utils} from "@/shared/utils/utils";
import { Entity } from "../../shared/entities/entity";
import { UserValidatorFactory } from "../../factories/user/user.validator.factory";
import { UserPasswordValidatorFactory } from "../../factories/user/user-password.validator.factory";
import { UserRole } from "generated/prisma";

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
  isActive: boolean;
};

export class User extends Entity {
  private name: string;
  private email: string;
  private password: string;
  private roles: UserRole[];  

  constructor(id: string, name: string, email: string, password: string, roles: UserRole[], createdAt: Date, updatedAt: Date, isActive: boolean) {
    super(id, createdAt, updatedAt, isActive);
    this.name = name;
    this.email = email;
    this.password = password;
    this.roles = roles;
    this.validate();
  }

  public static create({name, email, password, roles}: UserCreateDto): User {
    const id = Utils.GenerateUUID();
    const isActive = true;

    UserPasswordValidatorFactory.create().validate(password);

    const hashedPassword = Utils.encryptPassword(password);
    const createdAt = new Date();
    const updatedAt = new Date();
    return new User(id, name, email, hashedPassword, roles, createdAt, updatedAt, isActive);
  }

  public static with({
    id,
    name,
    email,
    password,
    roles,
    createdAt,
    updatedAt,
    isActive = true
  }: UserWithDto): User {
    return new User(id, name, email,  password, roles, createdAt, updatedAt, isActive);
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
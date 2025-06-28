// src/domain/entities/user/user.entitty.ts - Versão corrigida

import {Utils} from "@/shared/utils/utils";
import { Entity } from "../../shared/entities/entity";
import { UserValidatorFactory } from "../../factories/user/user.validator.factory";
import { UserPasswordValidatorFactory } from "../../factories/user/user-password.validator.factory";
import { UserRole } from "generated/prisma";

export type UserCreateDto = {
  email: string;
  password?: string; // ✅ Tornar opcional
  name: string;
  roles: UserRole[];
  isOAuthUser?: boolean; // ✅ Adicionar flag para OAuth
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

  public static create({name, email, password = '', roles, isOAuthUser = false}: UserCreateDto): User {
    const id = Utils.GenerateUUID();
    const isActive = true;

    // ✅ Só validar senha se não for OAuth e se tiver senha
    if (!isOAuthUser && password) {
      UserPasswordValidatorFactory.create().validate(password);
    }

    // ✅ Hash da senha apenas se tiver senha
    const hashedPassword = password ? Utils.encryptPassword(password) : '';
    
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
    // ✅ Se não tem senha (OAuth), retornar false
    if (!this.password) {
      return false;
    }
    return Utils.comparePassword(password, this.password);
  }

  // ✅ Verificar se é usuário OAuth
  public isOAuthUser(): boolean {
    return !this.password || this.password === '';
  }
}
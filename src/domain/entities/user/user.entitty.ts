// src/domain/entities/user/user.entitty.ts - ATUALIZADA com método update

import { Utils } from "@/shared/utils/utils";
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
  avatar?: string; // ✅ Adicionar avatar
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
  isOAuthUser?: boolean; // ✅ Adicionar flag para OAuth
  avatar: string; // ✅ Adicionar avatar
  emailVerified: boolean; // ✅ Adicionar verificação de e-mail
};

// ✅ NOVO: Tipo para update
export type UserUpdateDto = {
  name?: string;
  email?: string;
  avatar?: string;
  roles?: UserRole[];
  isActive?: boolean;
  emailVerified?: boolean;
  password?: string; // Nova senha
};

export class User extends Entity {
  private name: string;
  private email: string;
  private password: string;
  private roles: UserRole[];
  private avatar: string;
  private emailVerified: boolean;

  constructor(id: string, name: string, email: string, roles: UserRole[], avatar: string, emailVerified: boolean, password: string,  createdAt: Date, updatedAt: Date, isActive: boolean) {
    super(id, createdAt, updatedAt, isActive);
    this.name = name;
    this.email = email;
    this.password = password;
    this.roles = roles;
    this.avatar = avatar;
    this.emailVerified = emailVerified;
    this.validate();
  }

  public static create({name, email, roles, password = '', isOAuthUser = false, avatar=''}: UserCreateDto): User {
    const id = Utils.GenerateUUID();
    const isActive = true;
    const emailVerified = false; // ✅ Definir como false por padrão
    // ✅ Só validar senha se não for OAuth e se tiver senha
    if (!isOAuthUser && password) {
      UserPasswordValidatorFactory.create().validate(password);
    }

    // ✅ Hash da senha apenas se tiver senha
    const hashedPassword = password ? Utils.encryptPassword(password) : '';
    
    const createdAt = new Date();
    const updatedAt = new Date();
    return new User(id, name, email, roles, avatar, emailVerified, hashedPassword, createdAt, updatedAt, isActive);
  }

  public static with({
    id,
    name,
    email,
    password,
    roles,
    createdAt,
    updatedAt,
    isActive = true,
    avatar,
    emailVerified
  }: UserWithDto): User {
    return new User(id, name, email, roles, avatar, emailVerified, password, createdAt, updatedAt, isActive);
  }

  // ✅ NOVO: Método para atualizar usuário
  public update(updateData: UserUpdateDto): User {
    const updatedName = updateData.name !== undefined ? updateData.name.trim() : this.name;
    const updatedEmail = updateData.email !== undefined ? updateData.email.trim() : this.email;
    const updatedAvatar = updateData.avatar !== undefined ? updateData.avatar : this.avatar;
    const updatedRoles = updateData.roles !== undefined ? updateData.roles : this.roles;
    const updatedIsActive = updateData.isActive !== undefined ? updateData.isActive : this.isActive;
    const updatedEmailVerified = updateData.emailVerified !== undefined ? updateData.emailVerified : this.emailVerified;
    
    // Processar senha se fornecida
    let updatedPassword = this.password;
    if (updateData.password !== undefined) {
      if (updateData.password && updateData.password.length > 0) {
        // Validar e criptografar nova senha
        UserPasswordValidatorFactory.create().validate(updateData.password);
        updatedPassword = Utils.encryptPassword(updateData.password);
      } else {
        // Remover senha (para usuários OAuth)
        updatedPassword = '';
      }
    }

    // Atualizar timestamp
    const updatedAt = new Date();

    return new User(
      this.id,
      updatedName,
      updatedEmail,
      updatedRoles,
      updatedAvatar,
      updatedEmailVerified,
      updatedPassword,
      this.createdAt,
      updatedAt,
      updatedIsActive
    );
  }

  // ✅ NOVO: Método para validar se pode ser atualizado
  public canBeUpdated(): boolean {
    return this.isActive; // Usuários inativos não podem ser atualizados
  }

  // ✅ NOVO: Método para verificar se é admin
  public isAdmin(): boolean {
    return this.roles.includes(UserRole.ADMIN);
  }

  // ✅ NOVO: Método para verificar se é moderador
  public isModerator(): boolean {
    return this.roles.includes(UserRole.MODERATOR);
  }

  // ✅ NOVO: Método para verificar se tem roles elevadas
  public hasElevatedRoles(): boolean {
    return this.isAdmin() || this.isModerator();
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

  public getAvatar(): string | undefined {
    return this.avatar;
  }

  public isEmailVerified(): boolean {
    return this.emailVerified ?? false; // ✅ Retornar false se não definido
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
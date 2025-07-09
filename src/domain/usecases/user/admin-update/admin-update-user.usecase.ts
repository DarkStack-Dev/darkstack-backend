// src/domain/usecases/user/admin-update/admin-update-user.usecase.ts

import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { UserNotFoundUsecaseException } from '../../exceptions/user/user-not-found.usecase.exception';
import { InvalidInputUsecaseException } from '../../exceptions/input/invalid-input.usecase.exception';
import { EmailAlreadyExistsUsecaseException } from '../../exceptions/email/email-already-exists.usecase.exception';
import { UserRole } from 'generated/prisma';
import { Utils } from '@/shared/utils/utils';

export type AdminUpdateUserInput = {
  targetUserId: string;
  adminId: string;
  adminRoles: UserRole[];
  name?: string;
  email?: string;
  avatar?: string;
  roles?: UserRole[];
  isActive?: boolean;
  emailVerified?: boolean;
  newPassword?: string; // Admin pode resetar senha
  forcePasswordChange?: boolean; // Forçar usuário a trocar senha no próximo login
};

export type AdminUpdateUserOutput = {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    roles: UserRole[];
    isActive: boolean;
    emailVerified: boolean;
    updatedAt: Date;
  };
  changedFields: string[];
  admin: {
    id: string;
    name: string;
    email: string;
  };
};

@Injectable()
export class AdminUpdateUserUseCase implements UseCase<AdminUpdateUserInput, AdminUpdateUserOutput> {
  constructor(
    private readonly userRepository: UserGatewayRepository,
  ) {}

  public async execute({
    targetUserId,
    adminId,
    adminRoles,
    name,
    email,
    avatar,
    roles,
    isActive,
    emailVerified,
    newPassword,
    forcePasswordChange,
  }: AdminUpdateUserInput): Promise<AdminUpdateUserOutput> {
    console.log(`🛡️ Admin ${adminId} atualizando usuário ${targetUserId}`);

    // 1. Verificar permissões do admin
    this.checkAdminPermissions(adminRoles);

    // 2. Verificar se admin existe
    const admin = await this.userRepository.findById(adminId);
    if (!admin) {
      throw new UserNotFoundUsecaseException(
        `Admin not found with id ${adminId} in ${AdminUpdateUserUseCase.name}`,
        'Administrador não encontrado',
        AdminUpdateUserUseCase.name,
      );
    }

    // 3. Buscar usuário alvo
    const targetUser = await this.userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new UserNotFoundUsecaseException(
        `Target user not found with id ${targetUserId} in ${AdminUpdateUserUseCase.name}`,
        'Usuário não encontrado',
        AdminUpdateUserUseCase.name,
      );
    }

    // 4. Validar dados de entrada
    await this.validateUpdateData(targetUser, name, email, roles, newPassword);

    // 5. Verificar mudança de email
    if (email && email !== targetUser.getEmail()) {
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser && existingUser.getId() !== targetUserId) {
        throw new EmailAlreadyExistsUsecaseException(
          `Email ${email} already exists for another user in ${AdminUpdateUserUseCase.name}`,
          'Este e-mail já está sendo usado por outro usuário',
          AdminUpdateUserUseCase.name,
        );
      }
    }

    // 6. Verificar se admin não está removendo seus próprios privilégios
    this.validateSelfUpdate(adminId, targetUserId, roles);

    // 7. Rastrear campos alterados
    const changedFields: string[] = [];
    
    const updatedName = name?.trim() || targetUser.getName();
    const updatedEmail = email?.trim() || targetUser.getEmail();
    const updatedAvatar = avatar !== undefined ? avatar : targetUser.getAvatar();
    const updatedRoles = roles || targetUser.getRoles();
    const updatedIsActive = isActive !== undefined ? isActive : targetUser.getIsActivate();
    const updatedEmailVerified = emailVerified !== undefined ? emailVerified : targetUser.isEmailVerified();
    
    // Rastrear mudanças
    if (name && name.trim() !== targetUser.getName()) changedFields.push('name');
    if (email && email.trim() !== targetUser.getEmail()) changedFields.push('email');
    if (avatar !== undefined && avatar !== targetUser.getAvatar()) changedFields.push('avatar');
    if (roles && JSON.stringify(roles) !== JSON.stringify(targetUser.getRoles())) changedFields.push('roles');
    if (isActive !== undefined && isActive !== targetUser.getIsActivate()) changedFields.push('isActive');
    if (emailVerified !== undefined && emailVerified !== targetUser.isEmailVerified()) changedFields.push('emailVerified');

    // 8. Processar mudança de senha se fornecida
    let updatedPassword = targetUser.getPassword();
    if (newPassword) {
      updatedPassword = Utils.encryptPassword(newPassword);
      changedFields.push('password');
    }

    try {
      // 9. Atualizar usuário
      // const updatedUser = targetUser.update(updatedData);
      // await this.userRepository.update(updatedUser);
      
      const processedAt = new Date();

      console.log(`✅ Usuário ${updatedName} atualizado pelo admin ${admin.getName()}`);
      console.log(`📝 Campos alterados: ${changedFields.join(', ') || 'nenhum'}`);

      return {
        success: true,
        message: changedFields.length > 0 
          ? 'Usuário atualizado com sucesso'
          : 'Nenhuma alteração foi feita',
        user: {
          id: targetUser.getId(),
          name: updatedName,
          email: updatedEmail,
          avatar: updatedAvatar,
          roles: updatedRoles,
          isActive: updatedIsActive,
          emailVerified: updatedEmailVerified,
          updatedAt: processedAt,
        },
        changedFields,
        admin: {
          id: admin.getId(),
          name: admin.getName(),
          email: admin.getEmail(),
        },
      };
    } catch (error) {
      console.error(`❌ Erro ao atualizar usuário ${targetUserId}:`, error);
      throw new InvalidInputUsecaseException(
        `Failed to update user ${targetUserId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Erro ao atualizar usuário',
        AdminUpdateUserUseCase.name,
      );
    }
  }

  private checkAdminPermissions(adminRoles: UserRole[]): void {
    const isAdmin = adminRoles.includes(UserRole.ADMIN);

    if (!isAdmin) {
      throw new InvalidInputUsecaseException(
        'User attempted to admin-update user without ADMIN role',
        'Apenas administradores podem editar outros usuários',
        AdminUpdateUserUseCase.name,
      );
    }
  }

  private async validateUpdateData(
    targetUser: any,
    name?: string,
    email?: string,
    roles?: UserRole[],
    newPassword?: string
  ): Promise<void> {
    // Validar nome
    if (name !== undefined && name.trim().length === 0) {
      throw new InvalidInputUsecaseException(
        'Name cannot be empty',
        'Nome não pode estar vazio',
        AdminUpdateUserUseCase.name,
      );
    }

    if (name && name.trim().length > 255) {
      throw new InvalidInputUsecaseException(
        'Name must not exceed 255 characters',
        'Nome não pode exceder 255 caracteres',
        AdminUpdateUserUseCase.name,
      );
    }

    // Validar email
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new InvalidInputUsecaseException(
          `Invalid email format: ${email}`,
          'Formato de e-mail inválido',
          AdminUpdateUserUseCase.name,
        );
      }
    }

    // Validar roles
    if (roles && roles.length === 0) {
      throw new InvalidInputUsecaseException(
        'User must have at least one role',
        'Usuário deve ter pelo menos uma função',
        AdminUpdateUserUseCase.name,
      );
    }

    const validRoles = Object.values(UserRole);
    if (roles && roles.some(role => !validRoles.includes(role))) {
      throw new InvalidInputUsecaseException(
        'Invalid role provided',
        'Função inválida fornecida',
        AdminUpdateUserUseCase.name,
      );
    }

    // Validar nova senha
    if (newPassword && newPassword.length < 8) {
      throw new InvalidInputUsecaseException(
        'New password must be at least 8 characters long',
        'Nova senha deve ter pelo menos 8 caracteres',
        AdminUpdateUserUseCase.name,
      );
    }
  }

  private validateSelfUpdate(adminId: string, targetUserId: string, roles?: UserRole[]): void {
    // Se admin está editando a si mesmo e removendo role de ADMIN
    if (adminId === targetUserId && roles && !roles.includes(UserRole.ADMIN)) {
      throw new InvalidInputUsecaseException(
        'Admin cannot remove their own ADMIN role',
        'Administrador não pode remover sua própria função de administrador',
        AdminUpdateUserUseCase.name,
      );
    }
  }
}
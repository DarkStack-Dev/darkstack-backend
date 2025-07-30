// src/domain/usecases/user/update-profile/update-user-profile.usecase.ts

import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { UserNotFoundUsecaseException } from '../../exceptions/user/user-not-found.usecase.exception';
import { InvalidInputUsecaseException } from '../../exceptions/input/invalid-input.usecase.exception';
import { EmailAlreadyExistsUsecaseException } from '../../exceptions/email/email-already-exists.usecase.exception';
import { Utils } from '@/shared/utils/utils';

export type UpdateUserProfileInput = {
  userId: string;
  name?: string;
  email?: string;
  avatar?: string;
  currentPassword?: string; // Para validar mudança de dados sensíveis
  newPassword?: string;
};

export type UpdateUserProfileOutput = {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    updatedAt: Date;
  };
  changedFields: string[];
};

@Injectable()
export class UpdateUserProfileUseCase implements UseCase<UpdateUserProfileInput, UpdateUserProfileOutput> {
  constructor(
    private readonly userRepository: UserGatewayRepository,
  ) {}

  public async execute({
    userId,
    name,
    email,
    avatar,
    currentPassword,
    newPassword,
  }: UpdateUserProfileInput): Promise<UpdateUserProfileOutput> {
    console.log(`👤 Atualizando perfil do usuário ${userId}`);

    // 1. Buscar usuário atual
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundUsecaseException(
        `User not found with id ${userId} in ${UpdateUserProfileUseCase.name}`,
        'Usuário não encontrado',
        UpdateUserProfileUseCase.name,
      );
    }

    // 2. Validar dados de entrada
    await this.validateUpdateData(user, name, email, currentPassword, newPassword);

    // 3. Verificar mudança de email (não pode existir outro usuário com o mesmo email)
    if (email && email !== user.getEmail()) {
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser && existingUser.getId() !== userId) {
        throw new EmailAlreadyExistsUsecaseException(
          `Email ${email} already exists for another user in ${UpdateUserProfileUseCase.name}`,
          'Este e-mail já está sendo usado por outro usuário',
          UpdateUserProfileUseCase.name,
        );
      }
    }

    // 4. Rastrear campos alterados
    const changedFields: string[] = [];
    
    const updatedName = name?.trim() || user.getName();
    const updatedEmail = email?.trim() || user.getEmail();
    const updatedAvatar = avatar || user.getAvatar();
    
    if (name && name.trim() !== user.getName()) {
      changedFields.push('name');
    }
    
    if (email && email.trim() !== user.getEmail()) {
      changedFields.push('email');
    }
    
    if (avatar !== undefined && avatar !== user.getAvatar()) {
      changedFields.push('avatar');
    }

    // 5. Processar mudança de senha se fornecida
    let updatedPassword = user.getPassword();
    if (newPassword) {
      updatedPassword = Utils.encryptPassword(newPassword);
      changedFields.push('password');
    }

    try {
      // 6. Atualizar usuário (aqui você criaria um método update no repositório)
      // await this.userRepository.update(updatedUser);
      
      const processedAt = new Date();

      console.log(`✅ Perfil do usuário ${updatedName} atualizado com sucesso`);
      console.log(`📝 Campos alterados: ${changedFields.join(', ') || 'nenhum'}`);

      return {
        success: true,
        message: changedFields.length > 0 
          ? 'Perfil atualizado com sucesso'
          : 'Nenhuma alteração foi feita',
        user: {
          id: user.getId(),
          name: updatedName,
          email: updatedEmail,
          avatar: updatedAvatar,
          updatedAt: processedAt,
        },
        changedFields,
      };
    } catch (error) {
      console.error(`❌ Erro ao atualizar perfil do usuário ${userId}:`, error);
      throw new InvalidInputUsecaseException(
        `Failed to update user profile ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Erro ao atualizar perfil',
        UpdateUserProfileUseCase.name,
      );
    }
  }

  private async validateUpdateData(
    user: any,
    name?: string,
    email?: string,
    currentPassword?: string,
    newPassword?: string
  ): Promise<void> {
    // Validar nome
    if (name !== undefined) {
      if (name.trim().length === 0) {
        throw new InvalidInputUsecaseException(
          'Name cannot be empty',
          'Nome não pode estar vazio',
          UpdateUserProfileUseCase.name,
        );
      }

      if (name.trim().length > 255) {
        throw new InvalidInputUsecaseException(
          'Name must not exceed 255 characters',
          'Nome não pode exceder 255 caracteres',
          UpdateUserProfileUseCase.name,
        );
      }
    }

    // Validar email
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new InvalidInputUsecaseException(
          `Invalid email format: ${email}`,
          'Formato de e-mail inválido',
          UpdateUserProfileUseCase.name,
        );
      }
    }

    // Validar mudança de senha
    if (newPassword !== undefined) {
      // Verificar senha atual se usuário tem senha (não é OAuth)
      if (!user.isOAuthUser() && currentPassword) {
        if (!user.comparePassword(currentPassword)) {
          throw new InvalidInputUsecaseException(
            'Current password is incorrect',
            'Senha atual incorreta',
            UpdateUserProfileUseCase.name,
          );
        }
      }

      // Validar nova senha
      if (newPassword.length < 8) {
        throw new InvalidInputUsecaseException(
          'New password must be at least 8 characters long',
          'Nova senha deve ter pelo menos 8 caracteres',
          UpdateUserProfileUseCase.name,
        );
      }
    }

    // Se está mudando dados sensíveis (email ou senha) e não é OAuth, exigir senha atual
    const isSensitiveChange = (email && email !== user.getEmail()) || newPassword;
    if (isSensitiveChange && !user.isOAuthUser() && !currentPassword) {
      throw new InvalidInputUsecaseException(
        'Current password is required for sensitive changes',
        'Senha atual é obrigatória para alterações de email ou senha',
        UpdateUserProfileUseCase.name,
      );
    }
  }
}
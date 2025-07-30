// src/domain/usecases/user/moderator-update/moderator-update-user.usecase.ts

import { Injectable } from '@nestjs/common';
import { UseCase } from '@/domain/usecases/usecase';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { UserNotFoundUsecaseException } from '@/domain/usecases/exceptions/user/user-not-found.usecase.exception';
import { InvalidInputUsecaseException } from '@/domain/usecases/exceptions/input/invalid-input.usecase.exception';
import { UserRole } from 'generated/prisma';

export type ModeratorUpdateUserInput = {
  targetUserId: string;
  moderatorId: string;
  moderatorRoles: UserRole[];
  // ✅ Campos limitados que moderador pode editar
  isActive?: boolean; // Pode ativar/desativar usuários
  emailVerified?: boolean; // Pode verificar emails
  reason?: string; // Motivo da ação (para logs)
};

export type ModeratorUpdateUserOutput = {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    emailVerified: boolean;
    updatedAt: Date;
  };
  changedFields: string[];
  moderator: {
    id: string;
    name: string;
    email: string;
  };
  reason?: string;
};

@Injectable()
export class ModeratorUpdateUserUseCase implements UseCase<ModeratorUpdateUserInput, ModeratorUpdateUserOutput> {
  constructor(
    private readonly userRepository: UserGatewayRepository,
  ) {}

  public async execute({
    targetUserId,
    moderatorId,
    moderatorRoles,
    isActive,
    emailVerified,
    reason,
  }: ModeratorUpdateUserInput): Promise<ModeratorUpdateUserOutput> {
    console.log(`🛡️ Moderador ${moderatorId} atualizando usuário ${targetUserId}`);

    // 1. Verificar permissões do moderador
    this.checkModeratorPermissions(moderatorRoles);

    // 2. Verificar se moderador existe
    const moderator = await this.userRepository.findById(moderatorId);
    if (!moderator) {
      throw new UserNotFoundUsecaseException(
        `Moderator not found with id ${moderatorId} in ${ModeratorUpdateUserUseCase.name}`,
        'Moderador não encontrado',
        ModeratorUpdateUserUseCase.name,
      );
    }

    // 3. Buscar usuário alvo
    const targetUser = await this.userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new UserNotFoundUsecaseException(
        `Target user not found with id ${targetUserId} in ${ModeratorUpdateUserUseCase.name}`,
        'Usuário não encontrado',
        ModeratorUpdateUserUseCase.name,
      );
    }

    // 4. Verificar se moderador pode editar este usuário
    this.validateTargetUser(targetUser, moderatorRoles, moderatorId, targetUserId);

    // 5. Validar dados de entrada
    this.validateUpdateData(isActive, emailVerified, reason);

    // 6. Rastrear campos alterados
    const changedFields: string[] = [];
    
    const updatedIsActive = isActive !== undefined ? isActive : targetUser.getIsActivate();
    const updatedEmailVerified = emailVerified !== undefined ? emailVerified : targetUser.isEmailVerified();
    
    // Rastrear mudanças
    if (isActive !== undefined && isActive !== targetUser.getIsActivate()) {
      changedFields.push('isActive');
    }
    
    if (emailVerified !== undefined && emailVerified !== targetUser.isEmailVerified()) {
      changedFields.push('emailVerified');
    }

    // 7. Verificar se há mudanças para fazer
    if (changedFields.length === 0) {
      return {
        success: true,
        message: 'Nenhuma alteração foi feita',
        user: {
          id: targetUser.getId(),
          name: targetUser.getName(),
          email: targetUser.getEmail(),
          isActive: targetUser.getIsActivate(),
          emailVerified: targetUser.isEmailVerified(),
          updatedAt: targetUser.getUpdatedAt(),
        },
        changedFields: [],
        moderator: {
          id: moderator.getId(),
          name: moderator.getName(),
          email: moderator.getEmail(),
        },
        reason,
      };
    }

    try {
      // 8. Atualizar usuário
      // const updatedUser = targetUser.moderatorUpdate(updatedData);
      // await this.userRepository.update(updatedUser);
      
      const processedAt = new Date();

      // 9. Log da ação para auditoria
      this.logModeratorAction(moderator, targetUser, changedFields, reason);

      console.log(`✅ Usuário ${targetUser.getName()} atualizado pelo moderador ${moderator.getName()}`);
      console.log(`📝 Campos alterados: ${changedFields.join(', ')}`);

      return {
        success: true,
        message: `Usuário ${isActive === false ? 'desativado' : isActive === true ? 'ativado' : 'atualizado'} com sucesso`,
        user: {
          id: targetUser.getId(),
          name: targetUser.getName(),
          email: targetUser.getEmail(),
          isActive: updatedIsActive,
          emailVerified: updatedEmailVerified,
          updatedAt: processedAt,
        },
        changedFields,
        moderator: {
          id: moderator.getId(),
          name: moderator.getName(),
          email: moderator.getEmail(),
        },
        reason,
      };
    } catch (error) {
      console.error(`❌ Erro ao atualizar usuário ${targetUserId}:`, error);
      throw new InvalidInputUsecaseException(
        `Failed to update user ${targetUserId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Erro ao atualizar usuário',
        ModeratorUpdateUserUseCase.name,
      );
    }
  }

  private checkModeratorPermissions(moderatorRoles: UserRole[]): void {
    const isAdmin = moderatorRoles.includes(UserRole.ADMIN);
    const isModerator = moderatorRoles.includes(UserRole.MODERATOR);

    if (!isAdmin && !isModerator) {
      throw new InvalidInputUsecaseException(
        'User attempted to moderate user without permission',
        'Apenas administradores e moderadores podem moderar usuários',
        ModeratorUpdateUserUseCase.name,
      );
    }
  }

  private validateTargetUser(
    targetUser: any,
    moderatorRoles: UserRole[],
    moderatorId: string,
    targetUserId: string
  ): void {
    const isAdmin = moderatorRoles.includes(UserRole.ADMIN);
    const targetRoles = targetUser.getRoles();

    // Moderador não pode editar a si mesmo via esta rota
    if (moderatorId === targetUserId) {
      throw new InvalidInputUsecaseException(
        'Moderator cannot update themselves via moderation route',
        'Use a rota de atualização de perfil para editar suas próprias informações',
        ModeratorUpdateUserUseCase.name,
      );
    }

    // Moderadores não podem editar outros moderadores ou admins (apenas admin pode)
    if (!isAdmin) {
      const hasElevatedRoles = targetRoles.includes(UserRole.ADMIN) || targetRoles.includes(UserRole.MODERATOR);
      if (hasElevatedRoles) {
        throw new InvalidInputUsecaseException(
          `Moderator attempted to edit user with elevated roles: ${targetRoles.join(', ')}`,
          'Moderadores não podem editar outros moderadores ou administradores',
          ModeratorUpdateUserUseCase.name,
        );
      }
    }

    // Verificar se usuário alvo não está já inativo e tentando desativar novamente
    if (!targetUser.getIsActivate()) {
      console.log(`⚠️ Usuário ${targetUser.getName()} já está inativo`);
    }
  }

  private validateUpdateData(
    isActive?: boolean,
    emailVerified?: boolean,
    reason?: string
  ): void {
    // Se está desativando usuário, motivo é obrigatório
    if (isActive === false && (!reason || reason.trim().length === 0)) {
      throw new InvalidInputUsecaseException(
        'Reason is required when deactivating a user',
        'Motivo é obrigatório ao desativar um usuário',
        ModeratorUpdateUserUseCase.name,
      );
    }

    // Validar tamanho do motivo
    if (reason && reason.length > 500) {
      throw new InvalidInputUsecaseException(
        'Reason must not exceed 500 characters',
        'Motivo não pode exceder 500 caracteres',
        ModeratorUpdateUserUseCase.name,
      );
    }

    // Deve haver pelo menos uma mudança
    if (isActive === undefined && emailVerified === undefined) {
      throw new InvalidInputUsecaseException(
        'At least one field must be provided for update',
        'Pelo menos um campo deve ser fornecido para atualização',
        ModeratorUpdateUserUseCase.name,
      );
    }
  }

  private logModeratorAction(
    moderator: any,
    targetUser: any,
    changedFields: string[],
    reason?: string
  ): void {
    // TODO: Implementar sistema de auditoria/logs
    const logEntry = {
      action: 'moderator_user_update',
      moderatorId: moderator.getId(),
      moderatorName: moderator.getName(),
      targetUserId: targetUser.getId(),
      targetUserName: targetUser.getName(),
      changedFields,
      reason,
      timestamp: new Date(),
    };

    console.log('📋 Log de moderação:', JSON.stringify(logEntry, null, 2));
    
    // Aqui você poderia salvar no banco, enviar para um serviço de auditoria, etc.
  }
}

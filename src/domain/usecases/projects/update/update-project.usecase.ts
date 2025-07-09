// src/domain/usecases/projects/update/update-project.usecase.ts

import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { ProjectsGatewayRepository } from '@/domain/repositories/projects/projects.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { UserNotFoundUsecaseException } from '../../exceptions/user/user-not-found.usecase.exception';
import { InvalidInputUsecaseException } from '../../exceptions/input/invalid-input.usecase.exception';
import { ProjectStatus, ImageType, ProjectImage } from 'generated/prisma';
import { Utils } from '@/shared/utils/utils';

export type ProjectImageUpdateInput = {
  id?: string; // Se existir, atualiza; se não existir, cria nova
  filename: string;
  type: ImageType;
  size?: number;
  width?: number;
  height?: number;
  base64?: string;
  url?: string;
  metadata?: any;
  isMain?: boolean;
  order?: number;
  shouldDelete?: boolean; // Flag para deletar imagem existente
};

export type UpdateProjectInput = {
  projectId: string;
  userId: string;
  name?: string;
  description?: string;
  images?: ProjectImageUpdateInput[];
  shouldResetStatus?: boolean; // Se true, volta para PENDING após edição
};

export type UpdateProjectOutput = {
  success: boolean;
  message: string;
  project: {
    id: string;
    name: string;
    description: string;
    status: ProjectStatus;
    updatedAt: Date;
  };
  images: {
    id: string;
    filename: string;
    url: string;
    isMain: boolean;
    order: number;
  }[];
  statusChanged: boolean;
};

@Injectable()
export class UpdateProjectUseCase implements UseCase<UpdateProjectInput, UpdateProjectOutput> {
  constructor(
    private readonly projectsRepository: ProjectsGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
  ) {}

  public async execute({
    projectId,
    userId,
    name,
    description,
    images,
    shouldResetStatus = true, // Por padrão, resetar status após edição
  }: UpdateProjectInput): Promise<UpdateProjectOutput> {
    console.log(`✏️ Atualizando projeto ${projectId} por usuário ${userId}`);

    // 1. Verificar se usuário existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundUsecaseException(
        `User not found with id ${userId} in ${UpdateProjectUseCase.name}`,
        'Usuário não encontrado',
        UpdateProjectUseCase.name,
      );
    }

    // 2. Buscar o projeto
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw new UserNotFoundUsecaseException(
        `Project not found with id ${projectId} in ${UpdateProjectUseCase.name}`,
        'Projeto não encontrado',
        UpdateProjectUseCase.name,
      );
    }

    // 3. Verificar se usuário é o proprietário
    if (project.getOwnerId() !== userId) {
      throw new InvalidInputUsecaseException(
        `User ${userId} attempted to update project ${projectId} without ownership`,
        'Você só pode editar seus próprios projetos',
        UpdateProjectUseCase.name,
      );
    }

    // 4. Verificar se projeto pode ser editado
    this.validateProjectCanBeEdited(project);

    // 5. Validar dados de entrada
    this.validateUpdateData(name, description, images);

    // 6. Preparar dados atualizados
    const updatedName = name?.trim() || project.getName();
    const updatedDescription = description?.trim() || project.getDescription();
    const originalStatus = project.getStatus();
    
    // 7. Determinar novo status
    const newStatus = this.determineNewStatus(originalStatus, shouldResetStatus, name, description, images);
    const statusChanged = newStatus !== originalStatus;

    // 8. Processar imagens se fornecidas
    let updatedImages = project.getImages();
    if (images && images.length > 0) {
      updatedImages = this.processImageUpdates(images, projectId);
    }

    try {
      // 9. Criar projeto atualizado
      const updatedProject = project; // Aqui você criaria uma nova instância com os dados atualizados
      // updatedProject.update(updatedName, updatedDescription, newStatus, updatedImages);

      // 10. Persistir mudanças
      await this.projectsRepository.update(updatedProject);

      const processedAt = new Date();

      console.log(`✅ Projeto ${updatedName} atualizado com sucesso`);
      if (statusChanged) {
        console.log(`📊 Status alterado de ${originalStatus} para ${newStatus}`);
      }

      return {
        success: true,
        message: statusChanged 
          ? 'Projeto atualizado. Status alterado para análise de moderação.'
          : 'Projeto atualizado com sucesso',
        project: {
          id: project.getId(),
          name: updatedName,
          description: updatedDescription,
          status: newStatus,
          updatedAt: processedAt,
        },
        images: updatedImages.map(img => ({
          id: img.id,
          filename: img.filename,
          url: img.url || '',
          isMain: img.isMain,
          order: img.order,
        })),
        statusChanged,
      };
    } catch (error) {
      console.error(`❌ Erro ao atualizar projeto ${projectId}:`, error);
      throw new InvalidInputUsecaseException(
        `Failed to update project ${projectId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Erro ao atualizar projeto',
        UpdateProjectUseCase.name,
      );
    }
  }

  private validateProjectCanBeEdited(project: any): void {
    // Verificar se projeto está deletado
    if (project.getDeletedAt()) {
      throw new InvalidInputUsecaseException(
        `Cannot edit deleted project ${project.getId()}`,
        'Não é possível editar projetos deletados',
        UpdateProjectUseCase.name,
      );
    }

    // Verificar se projeto não está ativo
    if (!project.getIsActivate()) {
      throw new InvalidInputUsecaseException(
        `Cannot edit inactive project ${project.getId()}`,
        'Não é possível editar projetos inativos',
        UpdateProjectUseCase.name,
      );
    }
  }

  private validateUpdateData(name?: string, description?: string, images?: ProjectImageUpdateInput[]): void {
    if (name !== undefined) {
      if (name.trim().length === 0) {
        throw new InvalidInputUsecaseException(
          'Project name cannot be empty',
          'Nome do projeto não pode estar vazio',
          UpdateProjectUseCase.name,
        );
      }

      if (name.trim().length > 255) {
        throw new InvalidInputUsecaseException(
          'Project name must not exceed 255 characters',
          'Nome do projeto não pode exceder 255 caracteres',
          UpdateProjectUseCase.name,
        );
      }
    }

    if (description !== undefined) {
      if (description.trim().length === 0) {
        throw new InvalidInputUsecaseException(
          'Project description cannot be empty',
          'Descrição do projeto não pode estar vazia',
          UpdateProjectUseCase.name,
        );
      }

      if (description.trim().length > 5000) {
        throw new InvalidInputUsecaseException(
          'Project description must not exceed 5000 characters',
          'Descrição do projeto não pode exceder 5000 caracteres',
          UpdateProjectUseCase.name,
        );
      }
    }

    if (images && images.length > 0) {
      const activeImages = images.filter(img => !img.shouldDelete);
      
      if (activeImages.length === 0) {
        throw new InvalidInputUsecaseException(
          'Project must have at least one image',
          'Projeto deve ter pelo menos uma imagem',
          UpdateProjectUseCase.name,
        );
      }

      if (activeImages.length > 10) {
        throw new InvalidInputUsecaseException(
          'Project cannot have more than 10 images',
          'Projeto não pode ter mais de 10 imagens',
          UpdateProjectUseCase.name,
        );
      }

      const mainImages = activeImages.filter(img => img.isMain);
      if (mainImages.length !== 1) {
        throw new InvalidInputUsecaseException(
          'Project must have exactly one main image',
          'Projeto deve ter exatamente uma imagem principal',
          UpdateProjectUseCase.name,
        );
      }
    }
  }

  private determineNewStatus(
    originalStatus: ProjectStatus,
    shouldResetStatus: boolean,
    name?: string,
    description?: string,
    images?: ProjectImageUpdateInput[]
  ): ProjectStatus {
    // Se não deve resetar status ou não houve mudanças significativas
    if (!shouldResetStatus) {
      return originalStatus;
    }

    // Se era aprovado e houve mudanças, volta para pending
    if (originalStatus === ProjectStatus.APPROVED && (name || description || images)) {
      return ProjectStatus.PENDING;
    }

    // Se era rejeitado e houve mudanças, volta para pending
    if (originalStatus === ProjectStatus.REJECTED && (name || description || images)) {
      return ProjectStatus.PENDING;
    }

    // Mantém status original em outros casos
    return originalStatus;
  }

  private processImageUpdates(images: ProjectImageUpdateInput[], projectId: string): ProjectImage[] {
    const processedImages: ProjectImage[] = [];

    images.forEach((imageInput, index) => {
      // Pular imagens marcadas para deleção
      if (imageInput.shouldDelete) {
        return;
      }

      const processedImage: ProjectImage = {
        id: imageInput.id || Utils.GenerateUUID(),
        projectId: projectId,
        filename: imageInput.filename,
        type: imageInput.type,
        size: imageInput.size || null,
        width: imageInput.width || null,
        height: imageInput.height || null,
        base64: imageInput.base64 || null,
        url: imageInput.url || null,
        metadata: imageInput.metadata || null,
        order: imageInput.order ?? index,
        isMain: imageInput.isMain || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      processedImages.push(processedImage);
    });

    return processedImages;
  }
}
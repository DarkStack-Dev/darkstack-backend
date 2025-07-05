// ===== ROUTE =====

// src/infra/web/routes/projects/delete/delete-project.route.ts

import { Controller, Delete, Param, Req, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { ProjectsGatewayRepository } from '@/domain/repositories/projects/projects.gateway.repository';
import { ImageUploadService } from '@/infra/services/image-upload/image-upload.service';
import { DeleteProjectResponse } from './delete-project.dto';
import { DeleteProjectPresenter } from './delete-project.presenter';
import { Roles } from '@/infra/web/auth/decorators/roles.decorator';

@Controller('/projects')
export class DeleteProjectRoute {
  constructor(
    private readonly projectsRepository: ProjectsGatewayRepository,
    private readonly imageUploadService: ImageUploadService,
  ) {}

  @Delete('/:id')
  public async handle(
    @Param('id') projectId: string,
    @Req() req: Request,
  ): Promise<DeleteProjectResponse> {
    const userId = req['userId'];
    const userRoles = req['user']?.roles || [];

    console.log(`🗑️ Tentativa de deletar projeto ${projectId} por userId: ${userId}`);

    // Buscar o projeto
    const project = await this.projectsRepository.findById(projectId);
    
    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    // Verificar permissões: apenas o dono ou admin pode deletar
    const isOwner = project.getOwnerId() === userId;
    const isAdmin = userRoles.includes('ADMIN') || userRoles.includes('MODERATOR');

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Você não tem permissão para deletar este projeto');
    }

    try {
      // Fazer soft delete
      await this.projectsRepository.softDelete(projectId);
      
      const deletedAt = new Date();

      console.log(`✅ Projeto ${project.getName()} deletado com sucesso`);

      // Opcionalmente, deletar imagens do storage (comentado para permitir recuperação)
      // for (const image of project.getImages()) {
      //   if (image.filename) {
      //     await this.imageUploadService.deleteImage(image.filename, 'projects');
      //   }
      // }

      return DeleteProjectPresenter.toHttp(deletedAt);
    } catch (error) {
      console.error('❌ Erro ao deletar projeto:', error);
      throw error;
    }
  }

  // Rota adicional para hard delete (apenas admins)
  @Delete('/:id/permanent')
  @Roles('ADMIN')
  public async hardDelete(
    @Param('id') projectId: string,
    @Req() req: Request,
  ): Promise<DeleteProjectResponse> {
    const userId = req['userId'];

    console.log(`💀 Hard delete do projeto ${projectId} por admin ${userId}`);

    // Buscar o projeto (incluindo soft deleted)
    const project = await this.projectsRepository.findByIdIncludingDeleted(projectId);
    
    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    try {
      // Deletar imagens do storage
      for (const image of project.getImages()) {
        if (image.filename) {
          try {
            await this.imageUploadService.deleteImage(image.filename, 'projects');
            console.log(`🗑️ Imagem deletada: ${image.filename}`);
          } catch (error) {
            console.warn(`⚠️ Erro ao deletar imagem ${image.filename}:`, error);
          }
        }
      }

      // Hard delete do banco
      await this.projectsRepository.hardDelete(projectId);
      
      const deletedAt = new Date();

      console.log(`✅ Projeto ${project.getName()} removido permanentemente`);

      return {
        success: true,
        message: 'Projeto removido permanentemente',
        deletedAt,
      };
    } catch (error) {
      console.error('❌ Erro ao remover projeto permanentemente:', error);
      throw error;
    }
  }
}
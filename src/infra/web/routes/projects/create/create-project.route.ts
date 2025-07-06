// src/infra/web/routes/projects/create/create-project.route.ts - ATUALIZADA

import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { CreateProjectUsecase } from '@/usecases/projects/create/create-project.usecase'; // ✅ CORRIGIDO
import { ImageUploadService } from '@/infra/services/image-upload/image-upload.service';
import { CreateProjectRequest, CreateProjectResponse } from './create-project.dto';
import { CreateProjectPresenter } from './create-project.presenter';

@Controller('/projects')
export class CreateProjectRoute {
  constructor(
    private readonly createProjectUsecase: CreateProjectUsecase, // ✅ CORRIGIDO
    private readonly imageUploadService: ImageUploadService,
  ) {}

  @Post()
  public async handle(
    @Body() request: CreateProjectRequest,
    @Req() req: Request,
  ): Promise<CreateProjectResponse> {
    const userId = req['userId']; // Vem do AuthGuard

    console.log(`📋 Criando projeto "${request.name}" para userId: ${userId}`);
    console.log(`🖼️ Número de imagens: ${request.images.length}`);

    try {
      // 1. Fazer upload das imagens
      const uploadedImages = await Promise.all(
        request.images.map(async (image, index) => {
          console.log(`📤 Fazendo upload da imagem ${index + 1}: ${image.filename}`);
          
          const uploadResult = await this.imageUploadService.uploadImage({
            base64: image.base64,
            filename: image.filename,
            type: image.type,
            folder: 'projects',
          });

          return {
            filename: uploadResult.filename,
            type: image.type,
            size: uploadResult.size,
            url: uploadResult.url,
            width: uploadResult.width,
            height: uploadResult.height,
            isMain: image.isMain || false,
          };
        })
      );

      console.log(`✅ Upload de ${uploadedImages.length} imagens concluído`);

      // 2. Criar o projeto com as URLs das imagens
      const projectResult = await this.createProjectUsecase.execute({ // ✅ CORRIGIDO
        name: request.name,
        description: request.description,
        userId,
        images: uploadedImages,
      });

      console.log(`✅ Projeto criado com ID: ${projectResult.id}`);

      // 3. Preparar resposta com URLs das imagens
      const response = CreateProjectPresenter.toHttp(projectResult);
      response.images = uploadedImages.map((img, index) => ({
        id: `temp-${index}`, // O ID real seria do banco, aqui é temporário
        url: img.url,
        filename: img.filename,
        isMain: img.isMain,
      }));

      return response;
    } catch (error) {
      console.error('❌ Erro ao criar projeto:', error);
      throw error;
    }
  }
}
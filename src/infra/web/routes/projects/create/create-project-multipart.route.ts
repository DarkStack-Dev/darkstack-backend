import { 
  Body, 
  Controller, 
  Post, 
  Req, 
  UseInterceptors, 
  UploadedFiles,
  BadRequestException
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateProjectUsecase } from '@/usecases/projects/create/create-project.usecase';
import { ImageType } from 'generated/prisma';
import { Utils } from '@/shared/utils/utils';
import { CreateProjectMultipartRequest, CreateProjectMultipartResponse } from './create-project-multipart.dto';
import { CreateProjectMultipartPresenter } from './create-project-multipart.presenter';

@Controller('/projects')
export class CreateProjectMultipartRoute {
  constructor(
    private readonly createProjectUsecase: CreateProjectUsecase,
  ) {}

  @Post('/multipart')
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './public/uploads/projects',
        filename: (req, file, callback) => {
          // Gerar nome único usando UUID + extensão original
          const uniqueName = Utils.GenerateUUID() + extname(file.originalname);
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        // Verificar tipos de arquivo permitidos
        const allowedMimes = [
          'image/jpeg',
          'image/jpg', 
          'image/png',
          'image/gif',
          'image/webp',
          'image/svg+xml'
        ];
        
        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              `Tipo de arquivo não permitido: ${file.mimetype}. Tipos aceitos: JPG, JPEG, PNG, GIF, WEBP, SVG`
            ), 
            false
          );
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB por arquivo
        files: 5, // Máximo 5 arquivos
      },
    }),
  )
  public async handle(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() request: CreateProjectMultipartRequest,
    @Req() req: Request,
  ): Promise<CreateProjectMultipartResponse> {
    const userId = req['userId']; // Vem do AuthGuard

    console.log(`📁 Criando projeto multipart "${request.name}" para userId: ${userId}`);
    console.log(`📎 Arquivos recebidos: ${files?.length || 0}`);

    // Validar se tem arquivos
    if (!files || files.length === 0) {
      throw new BadRequestException('Pelo menos uma imagem é obrigatória');
    }

    if (files.length > 5) {
      throw new BadRequestException('Máximo de 5 imagens permitidas');
    }

    // Determinar qual imagem é a principal
    const mainImageIndex = request.mainImageIndex 
      ? parseInt(request.mainImageIndex) 
      : 0;

    if (mainImageIndex >= files.length || mainImageIndex < 0) {
      throw new BadRequestException(
        `mainImageIndex inválido. Deve ser entre 0 e ${files.length - 1}`
      );
    }

    try {
      // Converter arquivos para formato esperado pelo use case
      const images = files.map((file, index) => ({
        filename: file.filename,
        type: this.getImageTypeFromMime(file.mimetype),
        url: `${process.env.BASE_URL || 'http://localhost:3001'}/uploads/projects/${file.filename}`,
        size: file.size,
        width: undefined, // TODO: Implementar detecção de dimensões se necessário
        height: undefined,
        isMain: index === mainImageIndex,
      }));

      console.log(`🖼️ Imagens processadas: ${images.length}`);
      console.log(`⭐ Imagem principal: ${images[mainImageIndex].filename}`);

      // Executar use case
      const projectResult = await this.createProjectUsecase.execute({
        name: request.name,
        description: request.description,
        userId,
        images,
      });

      console.log(`✅ Projeto criado com ID: ${projectResult.id}`);

      // Preparar dados das imagens para resposta
      const uploadedImages = images.map((img, index) => ({
        id: `temp-${index}`, // ID temporário - seria substituído pelo ID real do banco
        url: img.url,
        filename: img.filename,
        isMain: img.isMain,
        size: img.size,
      }));

      return CreateProjectMultipartPresenter.toHttp(projectResult, uploadedImages);

    } catch (error) {
      console.error('❌ Erro ao criar projeto multipart:', error);
      
      // Limpar arquivos em caso de erro
      try {
        const fs = require('fs');
        files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
            console.log(`🗑️ Arquivo removido: ${file.filename}`);
          }
        });
      } catch (cleanupError) {
        console.warn('⚠️ Erro ao limpar arquivos:', cleanupError);
      }

      throw error;
    }
  }

  private getImageTypeFromMime(mimetype: string): ImageType {
    const mimeMap: Record<string, ImageType> = {
      'image/jpeg': ImageType.JPEG,
      'image/jpg': ImageType.JPG,
      'image/png': ImageType.PNG,
      'image/gif': ImageType.GIF,
      'image/webp': ImageType.WEBP,
      'image/svg+xml': ImageType.SVG,
    };
    
    return mimeMap[mimetype] || ImageType.PNG;
  }
}
// src/infra/services/image-upload/image-upload.service.ts

import { Injectable } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { ServiceException } from '../exceptions/service.exception';
import { ImageType } from 'generated/prisma';

export type ImageUploadInput = {
  base64: string;
  filename: string;
  type: ImageType;
  folder?: string;
};

export type ImageUploadOutput = {
  url: string;
  filename: string;
  size: number;
  width?: number;
  height?: number;
};

@Injectable()
export class ImageUploadService {
  constructor(private readonly storageService: StorageService) {}

  async uploadImage(input: ImageUploadInput): Promise<ImageUploadOutput> {
    try {
      // Validar e converter base64
      const { buffer, mimeType } = this.convertBase64ToBuffer(input.base64, input.type);

      // Fazer upload do arquivo
      const uploadResult = await this.storageService.uploadFile({
        buffer,
        filename: input.filename,
        mimeType,
        folder: input.folder || 'projects',
      });

      // TODO: Implementar detecção de dimensões da imagem se necessário
      // Usando bibliotecas como 'sharp' ou 'image-size'

      return {
        url: uploadResult.url,
        filename: uploadResult.filename,
        size: uploadResult.size,
        // width: dimensions.width,
        // height: dimensions.height,
      };
    } catch (error) {
      console.error('❌ Erro no upload da imagem:', error);
      
      if (error instanceof ServiceException) {
        throw error;
      }

      throw new ServiceException(
        `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Erro ao fazer upload da imagem',
        ImageUploadService.name,
      );
    }
  }

  async uploadMultipleImages(images: ImageUploadInput[]): Promise<ImageUploadOutput[]> {
    const uploadPromises = images.map(image => this.uploadImage(image));
    return Promise.all(uploadPromises);
  }

  async deleteImage(filename: string, folder?: string): Promise<void> {
    await this.storageService.deleteFile(filename, folder);
  }

  private convertBase64ToBuffer(base64: string, imageType: ImageType): { buffer: Buffer; mimeType: string } {
    try {
      // Remover prefixo data:image/xxx;base64, se existir
      const cleanBase64 = base64.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // Converter para buffer
      const buffer = Buffer.from(cleanBase64, 'base64');

      // Mapear tipo para MIME type
      const mimeTypeMap: Record<ImageType, string> = {
        [ImageType.JPG]: 'image/jpeg',
        [ImageType.JPEG]: 'image/jpeg',
        [ImageType.PNG]: 'image/png',
        [ImageType.WEBP]: 'image/webp',
        [ImageType.GIF]: 'image/gif',
        [ImageType.SVG]: 'image/svg+xml',
      };

      const mimeType = mimeTypeMap[imageType];
      if (!mimeType) {
        throw new Error(`Unsupported image type: ${imageType}`);
      }

      return { buffer, mimeType };
    } catch (error) {
      throw new ServiceException(
        `Failed to convert base64 to buffer: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Formato de imagem inválido',
        ImageUploadService.name,
      );
    }
  }

  private validateImageType(type: ImageType): void {
    const allowedTypes = Object.values(ImageType);
    if (!allowedTypes.includes(type)) {
      throw new ServiceException(
        `Invalid image type: ${type}`,
        'Tipo de imagem não suportado',
        ImageUploadService.name,
      );
    }
  }
}
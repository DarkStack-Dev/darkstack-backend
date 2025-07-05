// src/infra/services/storage/railway/railway-storage.service.ts - MELHORADO

import { Injectable } from '@nestjs/common';
import { StorageService, UploadFileInput, UploadFileOutput } from '../storage.service';
import { ServiceException } from '../../exceptions/service.exception';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Utils } from '@/shared/utils/utils';

@Injectable()
export class RailwayStorageService extends StorageService {
  private readonly uploadPath: string;
  private readonly baseUrl: string;
  private readonly isProduction: boolean;

  constructor() {
    super();
    this.isProduction = process.env.NODE_ENV === 'production';
    
    // No Railway, usar pasta absoluta para persistência
    this.uploadPath = this.isProduction 
      ? '/app/public/uploads'  // Railway
      : path.join(process.cwd(), 'public', 'uploads'); // Local
    
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    
    console.log(`📁 Storage configurado: ${this.uploadPath}`);
    console.log(`🌐 Base URL: ${this.baseUrl}`);
    console.log(`🏭 Ambiente: ${this.isProduction ? 'Produção' : 'Desenvolvimento'}`);
  }

  async uploadFile(input: UploadFileInput): Promise<UploadFileOutput> {
    try {
      // Validar tamanho (máximo 10MB por arquivo)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (input.buffer.length > maxSize) {
        throw new ServiceException(
          `File size ${input.buffer.length} exceeds maximum ${maxSize}`,
          'Arquivo muito grande. Máximo permitido: 10MB',
          RailwayStorageService.name,
        );
      }

      // Garantir que a pasta existe
      const folderPath = path.join(this.uploadPath, input.folder || 'projects');
      await this.ensureFolderExists(folderPath);

      // Gerar nome único e seguro para o arquivo
      const fileExtension = path.extname(input.filename);
      const safeExtension = this.validateExtension(fileExtension);
      const uniqueFilename = `${Utils.GenerateUUID()}${safeExtension}`;
      const filePath = path.join(folderPath, uniqueFilename);

      // Salvar o arquivo
      await fs.writeFile(filePath, input.buffer);

      // Gerar URL pública
      const publicPath = input.folder 
        ? `uploads/${input.folder}/${uniqueFilename}`
        : `uploads/projects/${uniqueFilename}`;
      
      const url = `${this.baseUrl}/${publicPath}`;

      console.log(`✅ Arquivo salvo: ${uniqueFilename} (${input.buffer.length} bytes)`);

      return {
        url,
        filename: uniqueFilename,
        size: input.buffer.length,
      };
    } catch (error) {
      console.error('❌ Erro ao fazer upload:', error);
      
      if (error instanceof ServiceException) {
        throw error;
      }
      
      throw new ServiceException(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Erro ao fazer upload do arquivo',
        RailwayStorageService.name,
      );
    }
  }

  async deleteFile(filename: string, folder?: string): Promise<void> {
    try {
      const folderPath = path.join(this.uploadPath, folder || 'projects');
      const filePath = path.join(folderPath, filename);

      // Verificar se o arquivo existe antes de tentar deletar
      try {
        await fs.access(filePath);
        await fs.unlink(filePath);
        console.log(`🗑️ Arquivo deletado: ${filename}`);
      } catch (error) {
        // Arquivo não existe, não é um erro crítico
        console.warn(`⚠️ Arquivo não encontrado para deleção: ${filename}`);
      }
    } catch (error) {
      console.error('❌ Erro ao deletar arquivo:', error);
      // Não lançar erro para não quebrar outras operações
    }
  }

  getFileUrl(filename: string, folder?: string): string {
    const publicPath = folder 
      ? `uploads/${folder}/${filename}`
      : `uploads/projects/${filename}`;
    
    return `${this.baseUrl}/${publicPath}`;
  }

  private async ensureFolderExists(folderPath: string): Promise<void> {
    try {
      await fs.access(folderPath);
    } catch {
      await fs.mkdir(folderPath, { recursive: true });
      console.log(`📁 Pasta criada: ${folderPath}`);
    }
  }

  private validateExtension(extension: string): string {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
    const lowerExt = extension.toLowerCase();
    
    if (!allowedExtensions.includes(lowerExt)) {
      throw new ServiceException(
        `Invalid file extension: ${extension}`,
        `Tipo de arquivo não permitido: ${extension}`,
        RailwayStorageService.name,
      );
    }
    
    return lowerExt;
  }

  // Método para cleanup de arquivos órfãos (opcional)
  async cleanupOrphanedFiles(olderThanDays = 7): Promise<void> {
    if (!this.isProduction) {
      console.log('🧹 Cleanup desabilitado em desenvolvimento');
      return;
    }

    try {
      const projectsPath = path.join(this.uploadPath, 'projects');
      const files = await fs.readdir(projectsPath);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(projectsPath, file);
        const stats = await fs.stat(filePath);
        
        if (stats.mtime < cutoffDate) {
          // TODO: Verificar se arquivo ainda está sendo usado no banco
          // Por enquanto, apenas log
          console.log(`🧹 Arquivo órfão encontrado: ${file} (${stats.mtime})`);
        }
      }

      console.log(`🧹 Cleanup concluído. ${deletedCount} arquivos removidos.`);
    } catch (error) {
      console.error('❌ Erro no cleanup:', error);
    }
  }
}
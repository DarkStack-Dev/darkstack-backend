// src/infra/web/filters/multer-exception.filter.ts

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';

    // Tratar erros específicos do Multer
    if (exception.code === 'LIMIT_FILE_SIZE') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Arquivo muito grande. Tamanho máximo: 10MB';
    } else if (exception.code === 'LIMIT_FILE_COUNT') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Muitos arquivos. Máximo: 5 arquivos';
    } else if (exception.code === 'LIMIT_UNEXPECTED_FILE') {
      status = HttpStatus.BAD_REQUEST;
      message = 'Campo de arquivo inesperado';
    } else if (exception.message && exception.message.includes('Tipo de arquivo não permitido')) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    }

    console.error('❌ Multer Error:', exception);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message,
    });
  }
}
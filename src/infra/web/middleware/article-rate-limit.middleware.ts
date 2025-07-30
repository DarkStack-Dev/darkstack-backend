// 4. Middleware para rate limiting de criação de artigos
// src/infra/web/middleware/article-rate-limit.middleware.ts
import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ArticleGatewayRepository } from '@/domain/repositories/article/article.gateway.repository';

@Injectable()
export class ArticleRateLimitMiddleware implements NestMiddleware {
  private readonly rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  constructor(
    private readonly articleRepository: ArticleGatewayRepository,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Aplicar apenas em POST /articles
    if (req.method !== 'POST' || !req.path.startsWith('/articles')) {
      return next();
    }

    const userId = req['userId'];
    if (!userId) {
      return next(); // Deixar o AuthGuard lidar com usuários não autenticados
    }

    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hora
    const maxRequests = 3; // Máximo 3 tentativas de criação por hora

    const userLimit = this.rateLimitMap.get(userId);

    if (userLimit) {
      if (now < userLimit.resetTime) {
        if (userLimit.count >= maxRequests) {
          return res.status(HttpStatus.TOO_MANY_REQUESTS).json({
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            timestamp: new Date().toISOString(),
            message: 'Muitas tentativas de criação de artigos. Tente novamente em 1 hora.',
          });
        } else {
          userLimit.count++;
        }
      } else {
        // Reset do contador
        userLimit.count = 1;
        userLimit.resetTime = now + windowMs;
      }
    } else {
      this.rateLimitMap.set(userId, {
        count: 1,
        resetTime: now + windowMs,
      });
    }

    next();
  }
}
// 3. ✅ RATE LIMITING PARA LIKES
// src/infra/web/middleware/like-rate-limit.middleware.ts
import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LikeRateLimitMiddleware implements NestMiddleware {
  private readonly rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  async use(req: Request, res: Response, next: NextFunction) {
    // Aplicar apenas em operações de like
    if (!req.path.includes('/likes/')) {
      return next();
    }

    const userId = req['userId'];
    if (!userId) {
      return next(); // Deixar AuthGuard lidar com não autenticados
    }

    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minuto
    const maxRequests = 10; // Máximo 10 likes por minuto

    const userLimit = this.rateLimitMap.get(userId);

    if (userLimit) {
      if (now < userLimit.resetTime) {
        if (userLimit.count >= maxRequests) {
          return res.status(HttpStatus.TOO_MANY_REQUESTS).json({
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            timestamp: new Date().toISOString(),
            message: 'Muitos likes em pouco tempo. Aguarde um momento.',
            retryAfter: Math.ceil((userLimit.resetTime - now) / 1000),
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
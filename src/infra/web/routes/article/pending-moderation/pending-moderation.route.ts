// src/infra/web/routes/article/pending-moderation/pending-moderation.route.ts - CORRIGIDO
import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { GetPendingModerationUsecase } from '@/usecases/article/get-pending-moderation/get-pending-moderation.usecase';
import { PendingModerationResponse, PendingModerationPresenter } from './pending-moderation.presenter';
import { Roles } from '@/infra/web/auth/decorators/roles.decorator';

@Controller('/articlesa')
export class PendingModerationRoute {
  constructor(
    private readonly getPendingModerationUsecase: GetPendingModerationUsecase, // ✅ Usando caso de uso
  ) {}

  @Get('/pending-moderation')
  @Roles('ADMIN', 'MODERATOR')
  public async handle(
    @Query('includeOwn') includeOwn: string,
    @Req() req: Request,
  ): Promise<PendingModerationResponse> {
    const moderatorId = req['userId'];
    const moderatorRoles = req['user']?.roles || [];
    const shouldIncludeOwn = includeOwn === 'true';

    console.log(`🔍 Buscando artigos pendentes para moderador ${moderatorId}`);

    const output = await this.getPendingModerationUsecase.execute({
      moderatorId,
      moderatorRoles,
      includeOwn: shouldIncludeOwn,
    });

    console.log(`✅ Encontrados ${output.total} artigos pendentes`);

    return PendingModerationPresenter.toHttp(output);
  }
}
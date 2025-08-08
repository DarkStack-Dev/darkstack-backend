// src/infra/web/routes/like/get-likes/get-likes.presenter.ts
import { GetLikesOutput } from '@/usecases/like/get-likes/get-likes.usecase';
import { GetLikesResponse } from './get-likes.dto';
import { LikeTarget } from '@/domain/entities/like/like.entity';

export class GetLikesPresenter {
  public static toHttp(output: GetLikesOutput, targetId: string, targetType: LikeTarget): GetLikesResponse {
    return {
      likes: output.likes,
      pagination: output.pagination,
      summary: output.summary,
      targetInfo: {
        targetId,
        targetType,
      },
    };
  }
}
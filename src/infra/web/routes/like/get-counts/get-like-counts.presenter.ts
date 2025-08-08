// src/infra/web/routes/like/get-counts/get-like-counts.presenter.ts
import { GetLikeCountsOutput } from '@/usecases/like/get-counts/get-like-counts.usecase';
import { GetLikeCountsResponse } from './get-like-counts.dto';

export class GetLikeCountsPresenter {
  public static toHttp(output: GetLikeCountsOutput): GetLikeCountsResponse {
    const total = output.likesCount + output.dislikesCount;
    const likeRatio = total > 0 ? output.likesCount / total : 0;

    return {
      targetId: output.targetId,
      targetType: output.targetType,
      likesCount: output.likesCount,
      dislikesCount: output.dislikesCount,
      netLikes: output.netLikes,
      currentUserLike: output.currentUserLike,
      likeRatio: Math.round(likeRatio * 100) / 100, // 2 casas decimais
    };
  }
}

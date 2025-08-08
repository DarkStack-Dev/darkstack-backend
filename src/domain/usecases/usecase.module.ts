import { Module } from '@nestjs/common';
import { CreateUserUseCase } from './user/create/create-user.usecase';
import { FindUserUseCase } from './user/find-by-id/find-user.usecase';
import { SigninUserUseCase } from './user/signin/signin-user.usecase';
import { RefreshAuthTokenUserUsecase } from './user/refresh-auth-token/refresh-auth-token-user.usecase';
import { DatabaseModule } from 'src/infra/repositories/database.module';
import { ServiceModule } from 'src/infra/services/service.module';

// ✅ ADICIONAR - Like Domain Use Cases
import { ToggleLikeUseCase } from './like/toggle/toggle-like.usecase';
import { GetLikesUseCase } from './like/get-likes/get-likes.usecase';
import { GetLikeCountsUseCase } from './like/get-like-counts/get-like-counts.usecase';

@Module({
  imports: [DatabaseModule, ServiceModule],
  providers: [
    CreateUserUseCase,
    FindUserUseCase,
    SigninUserUseCase,
    RefreshAuthTokenUserUsecase,

    // ✅ ADICIONAR - Like Domain Use Cases
    ToggleLikeUseCase,
    GetLikesUseCase,
    GetLikeCountsUseCase,
  ],
  exports: [
    CreateUserUseCase,
    FindUserUseCase,
    SigninUserUseCase,
    RefreshAuthTokenUserUsecase,

    // ✅ ADICIONAR - Export Like Domain Use Cases
    ToggleLikeUseCase,
    GetLikesUseCase,
    GetLikeCountsUseCase,
  ],
})
export class UsecaseModule {}
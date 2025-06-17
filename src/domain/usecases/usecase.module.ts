import { Module } from '@nestjs/common';
import { CreateUserUseCase } from './user/create/create-user.usecase';
import { FindUserUseCase } from './user/find-by-id/find-user.usecase';
import { SigninUserUseCase } from './user/signin/signin-user.usecase';
import { RefreshAuthTokenUserUsecase } from './user/refresh-auth-token/refresh-auth-token-user.usecase';
import { DatabaseModule } from 'src/infra/repositories/database.module';
import { ServiceModule } from 'src/infra/services/service.module';

@Module({
  imports: [DatabaseModule, ServiceModule],
  providers: [
    CreateUserUseCase,
    FindUserUseCase,
    SigninUserUseCase,
    RefreshAuthTokenUserUsecase,
  ],
  exports: [
    CreateUserUseCase,
    FindUserUseCase,
    SigninUserUseCase,
    RefreshAuthTokenUserUsecase,
  ],
})
export class UsecaseModule {}
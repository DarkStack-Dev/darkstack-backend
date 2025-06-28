// Atualizar: src/usecases/usecase.module.ts
import { Module } from '@nestjs/common';
import { CreateUserUsecase } from './user/create/create-user.usecase';
import { FindUserUsecase } from './user/find-by-id/find-user.usecase';
import { LoginUserUsecase } from './user/login/login-user.usecase';
import { RefreshAuthTokenUserUsecase } from './user/refresh-auth-token/refresh-auth-token-user.usecase';
import { StartGitHubAuthUseCase } from '@/domain/usecases/github-auth/start-github-auth/start-github-auth.usecase';
import { GitHubCallbackUseCase } from '@/domain/usecases/github-auth/github-callback/github-callback.usecase';
import { LinkGitHubAccountUseCase } from '@/domain/usecases/github-auth/link-github-account/link-github-account.usecase';
import { UnlinkGitHubAccountUseCase } from '@/domain/usecases/github-auth/unlink-github-account/unlink-github-account.usecase';
import { DatabaseModule } from 'src/infra/repositories/database.module';
import { ServiceModule } from 'src/infra/services/service.module';

@Module({
  imports: [DatabaseModule, ServiceModule],
  providers: [
    // User use cases
    CreateUserUsecase,
    FindUserUsecase,
    LoginUserUsecase,
    RefreshAuthTokenUserUsecase,
    
    // GitHub auth use cases
    StartGitHubAuthUseCase,
    GitHubCallbackUseCase,
    LinkGitHubAccountUseCase,
    UnlinkGitHubAccountUseCase,
  ],
  exports: [
    // User use cases
    CreateUserUsecase,
    FindUserUsecase,
    LoginUserUsecase,
    RefreshAuthTokenUserUsecase,
    
    // GitHub auth use cases
    StartGitHubAuthUseCase,
    GitHubCallbackUseCase,
    LinkGitHubAccountUseCase,
    UnlinkGitHubAccountUseCase,
  ],
})
export class UsecaseModule {}
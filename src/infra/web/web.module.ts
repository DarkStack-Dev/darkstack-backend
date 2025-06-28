// Atualizar: src/infra/web/web.module.ts
import { Module } from '@nestjs/common';
import { UsecaseModule } from 'src/usecases/usecase.module';
import { DomainExceptionFilterProvider } from './filters/domain/domain-exception.filter';
import { ValidatorDomainExceptionFilterProvider } from './filters/domain/validator-domain-exception.filter';
import { CredentialsNotValidUsecaseExceptionFilterProvider } from './filters/usecases/credentials-not-valid-usecase-exception.filter';
import { EmailAlreadyExistsUsecaseExceptionFilterProvider } from './filters/usecases/email-already-exists-usecase-exception.filter';
import { UsecaseExceptionFilterProvider } from './filters/usecases/usecase-exception.filter';
import { UserNotFoundUsecaseExceptionFilterProvider } from './filters/usecases/user-not-found-usecase-exception.filter';
import { CreateUserRoute } from './routes/user/create/create-user.route';
import { ServiceExceptionFilterProvider } from './filters/infra/services/service-exception.filter';
import { RefreshTokenNotValidServiceExceptionFilterProvider } from './filters/infra/services/refresh-token-not-valid-service-exception.filter';
import { LoginUserRoute } from './routes/user/login/login-user.route';
import { RefreshAuthTokenRoute } from './routes/user/refresh-auth-token/refresh-auth-token.route';
import { FindByIdUserRoute } from './routes/user/find-by-id/find-by-id-user.route';
import { AuthGuardProvider } from './auth/auth.guards';
import { ServiceModule } from '../services/service.module';
import { MeUserRoute } from './routes/user/me/me-user.route';

// GitHub Auth Routes
import { StartGitHubAuthRoute } from './routes/github-auth/start/start-github-auth.route';
import { GitHubCallbackRoute } from './routes/github-auth/callback/github-callback.route';
import { LinkGitHubAccountRoute } from './routes/github-auth/link/link-github-account.route';
import { UnlinkGitHubAccountRoute } from './routes/github-auth/unlink/unlink-github-account.route';

@Module({
  imports: [ServiceModule, UsecaseModule],
  controllers: [
    // User routes
    CreateUserRoute,
    LoginUserRoute,
    RefreshAuthTokenRoute,
    FindByIdUserRoute,
    MeUserRoute,
    
    // GitHub auth routes
    StartGitHubAuthRoute,
    GitHubCallbackRoute,
    LinkGitHubAccountRoute,
    UnlinkGitHubAccountRoute,
  ],
  providers: [
    AuthGuardProvider,
    ValidatorDomainExceptionFilterProvider,
    DomainExceptionFilterProvider,
    UsecaseExceptionFilterProvider,
    CredentialsNotValidUsecaseExceptionFilterProvider,
    EmailAlreadyExistsUsecaseExceptionFilterProvider,
    UsecaseExceptionFilterProvider,
    UserNotFoundUsecaseExceptionFilterProvider,
    ServiceExceptionFilterProvider,
    RefreshTokenNotValidServiceExceptionFilterProvider,
  ],
})
export class WebModule {}
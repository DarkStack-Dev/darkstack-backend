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
import { StartGoogleAuthUseCase } from '@/domain/usecases/google-auth/start-google-auth/start-google-auth.usecase';
import { GoogleCallbackUseCase } from '@/domain/usecases/google-auth/google-callback/google-callback.usecase';
import { DatabaseModule } from 'src/infra/repositories/database.module';
import { ServiceModule } from 'src/infra/services/service.module';
// Project use cases
import { CreateProjectsUseCase } from '@/domain/usecases/projects/create/create-projects.usecase';

import { ListProjectsUseCase } from '@/domain/usecases/projects/list/list-projects.usecase';
import { MyProjectsUseCase } from '@/domain/usecases/projects/my-projects/my-projects.usecase';
// User providers use case - ✅ ADICIONADO
import { UserProvidersUseCase } from '@/domain/usecases/providers/user-providers.usecase';
import { DeleteProjectUseCase } from '@/domain/usecases/projects/delete/delete-project.usecase';
import { RestoreProjectUseCase } from '@/domain/usecases/projects/restore/restore-project.usecase';
import { ListDeletedProjectsUseCase } from '@/domain/usecases/projects/list-deleted/list-deleted-projects.usecase';
import { CreateProjectUsecase } from './projects/create/create-project.usecase';
import { FindProjectByIdUsecase } from './projects/find-by-id/find-project-by-id.usecase';
import { FindProjectByIdUseCase } from '@/domain/usecases/projects/find-by-id/find-project-by-id.usecase';
import { ListProjectsUsecase } from './projects/list/list-projects.usecase';
import { MyProjectsUsecase } from './projects/my-projects/my-projects.usecase';
import { DeleteProjectUsecase } from './projects/delete/delete-project.usecase';
import { RestoreProjectUsecase } from './projects/restore/restore-project.usecase';
import { ListDeletedProjectsUsecase } from './projects/list-deleted/list-deleted-projects.usecase';

// ✅ ADICIONAR: Article use cases - Domain Layer
import { CreateArticleUseCase } from '@/domain/usecases/article/create/create-article.usecase';
import { FindArticleByIdUseCase } from '@/domain/usecases/article/find-by-id/find-article-by-id.usecase';
import { ListArticlesUseCase } from '@/domain/usecases/article/list/list-articles.usecase';

// ✅ ADICIONAR: Article use cases - Application Layer
import { CreateArticleUsecase } from './article/create/create-article.usecase';
import { FindArticleByIdUsecase } from './article/find-by-id/find-article-by-id.usecase';
import { ListArticlesUsecase } from './article/list/list-articles.usecase';
import { MyArticlesUsecase } from './article/my-articles/my-articles.usecase';
import { ModerateArticleUsecase } from './article/moderate/moderate-article.usecase';

@Module({
  imports: [DatabaseModule, ServiceModule],
  providers: [
    // User use cases
    CreateUserUsecase,
    FindUserUsecase,
    LoginUserUsecase,
    RefreshAuthTokenUserUsecase,
    UserProvidersUseCase, // ✅ ADICIONADO
    
    // GitHub auth use cases
    StartGitHubAuthUseCase,
    GitHubCallbackUseCase,
    LinkGitHubAccountUseCase,
    UnlinkGitHubAccountUseCase,

    // Google auth use cases
    StartGoogleAuthUseCase,
    GoogleCallbackUseCase,

    // Project use cases
    CreateProjectsUseCase,
    CreateProjectUsecase,
    FindProjectByIdUsecase,
    FindProjectByIdUseCase,
    ListProjectsUseCase,
    ListProjectsUsecase,
    MyProjectsUseCase,
    MyProjectsUsecase,
    DeleteProjectUseCase,
    DeleteProjectUsecase,
    RestoreProjectUseCase,
    RestoreProjectUsecase,
    ListDeletedProjectsUseCase,
    ListDeletedProjectsUsecase,

    // ✅ NOVO: Article use cases - Domain Layer
    CreateArticleUseCase,
    FindArticleByIdUseCase,
    ListArticlesUseCase,

    // ✅ NOVO: Article use cases - Application Layer
    CreateArticleUsecase,
    FindArticleByIdUsecase,
    ListArticlesUsecase,
    MyArticlesUsecase,
    ModerateArticleUsecase,
  ],
  exports: [
    // User use cases
    CreateUserUsecase,
    FindUserUsecase,
    LoginUserUsecase,
    RefreshAuthTokenUserUsecase,
    UserProvidersUseCase, // ✅ ADICIONADO
    
    // GitHub auth use cases
    StartGitHubAuthUseCase,
    GitHubCallbackUseCase,
    LinkGitHubAccountUseCase,
    UnlinkGitHubAccountUseCase,

    // Google auth use cases
    StartGoogleAuthUseCase,
    GoogleCallbackUseCase,

    // Project use cases
    CreateProjectsUseCase,
    CreateProjectUsecase,
    FindProjectByIdUsecase,
    FindProjectByIdUseCase,
    ListProjectsUseCase,
    ListProjectsUsecase,
    MyProjectsUseCase,
    MyProjectsUsecase,
    DeleteProjectUseCase,
    DeleteProjectUsecase,
    RestoreProjectUseCase,
    RestoreProjectUsecase,
    ListDeletedProjectsUseCase,
    ListDeletedProjectsUsecase,
    

    // ✅ NOVO: Article use cases - Domain Layer
    CreateArticleUseCase,
    FindArticleByIdUseCase,
    ListArticlesUseCase,

    // ✅ NOVO: Article use cases - Application Layer
    CreateArticleUsecase,
    FindArticleByIdUsecase,
    ListArticlesUsecase,
    MyArticlesUsecase,
    ModerateArticleUsecase,
  ],
})
export class UsecaseModule {}
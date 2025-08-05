// src/infra/web/web.module.ts - ATUALIZADO COM NOTIFICAÇÕES
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
import { WebSocketModule } from '@/infra/websocket/websocket.module'; // ✅ NOVO

// GitHub Auth Routes
import { StartGitHubAuthRoute } from './routes/github-auth/start/start-github-auth.route';
import { GitHubCallbackRoute } from './routes/github-auth/callback/github-callback.route';
import { LinkGitHubAccountRoute } from './routes/github-auth/link/link-github-account.route';
import { UnlinkGitHubAccountRoute } from './routes/github-auth/unlink/unlink-github-account.route';
import { UserProvidersRoute } from './routes/user/providers/user-providers.route';

// Google Auth Routes
import { StartGoogleAuthRoute } from './routes/google-auth/start/start-google-auth.route';
import { GoogleCallbackRoute } from './routes/google-auth/callback/google-callback.route';

// Project routes
import { CreateProjectRoute } from './routes/projects/create/create-project.route';
import { FindProjectByIdRoute } from './routes/projects/find-by-id/find-project-by-id.route';
import { ListProjectsRoute } from './routes/projects/list/list-projects.route';
import { MyProjectsRoute } from './routes/projects/my-projects/my-projects.route';
import { DeleteProjectRoute } from './routes/projects/delete/delete-project.route';
import { ListDeletedProjectsRoute } from './routes/projects/list-deleted/list-deleted-projects.route';
import { CreateProjectMultipartRoute } from './routes/projects/create/create-project-multipart.route';

// Project Exception Filters
import { ProjectNotFoundUsecaseExceptionFilterProvider } from './filters/usecases/projects/project-not-found-usecase-exception.filter';
import { ProjectLimitReachedUsecaseExceptionFilterProvider } from './filters/usecases/projects/project-limit-reached-usecase-exception.filter';
import { ProjectAccessDeniedUsecaseExceptionFilterProvider } from './filters/usecases/projects/project-access-denied-usecase-exception.filter';

// Article routes
import { CreateArticleRoute } from './routes/article/create/create-article.route';
import { FindArticleByIdRoute } from './routes/article/find-by-id/find-article-by-id.route';
import { FindArticleBySlugRoute } from './routes/article/find-by-slug/find-article-by-slug.route';
import { ListArticlesRoute } from './routes/article/list/list-articles.route';
import { MyArticlesRoute } from './routes/article/my-articles/my-articles.route';
import { ModerateArticleRoute } from './routes/article/moderate/moderate-article.route';
import { PendingModerationRoute } from './routes/article/pending-moderation/pending-moderation.route';
import { SearchArticlesRoute } from './routes/article/search/search-articles.route';
import { ArticleStatsRoute } from './routes/article/stats/article-stats.route';
import { PopularTagsRoute } from './routes/article/tags/popular-tags.route';
import { ApproveArticleRoute } from './routes/article/moderate/approve-article.route';
import { RejectArticleRoute } from './routes/article/moderate/reject-article.route';

// Article exception filters
import { ArticleNotFoundUsecaseExceptionFilterProvider } from './filters/usecases/article/article-not-found-usecase-exception.filter';
import { ArticleLimitReachedUsecaseExceptionFilterProvider } from './filters/usecases/article/article-limit-reached-usecase-exception.filter';
import { ArticleAccessDeniedUsecaseExceptionFilterProvider } from './filters/usecases/article/article-access-denied-usecase-exception.filter';

// ✅ NOTIFICATION ROUTES (NOVOS)
import { FindNotificationsByUserRoute } from './routes/notification/find-by-user/find-notifications-by-user.route';
import { MarkNotificationAsReadRoute } from './routes/notification/mark-as-read/mark-notification-as-read.route';
import { MarkAllNotificationsAsReadRoute } from './routes/notification/mark-all-read/mark-all-read.route';
import { GetUnreadNotificationsCountRoute } from './routes/notification/get-unread-count/get-unread-count.route';
import { NotificationStreamRoute } from './routes/notification/stream/notification-stream.route';
import { WebSocketStatusRoute } from './routes/notification/websocket-status/websocket-status.route';

// ✅ ADICIONAR - Comment Controllers
import { CreateCommentRoute } from './routes/comment/create/create-comment.route';
import { ListCommentsRoute } from './routes/comment/list/list-comments.route';
import { FindRepliesRoute } from './routes/comment/find-replies/find-replies.route';
import { UpdateCommentRoute } from './routes/comment/update/update-comment.route';
import { DeleteCommentRoute } from './routes/comment/delete/delete-comment.route';
import { CountCommentsRoute } from './routes/comment/count/count-comments.route';
import { ApproveCommentRoute } from './routes/comment/moderate/approve-comment.route';
import { RejectCommentRoute } from './routes/comment/moderate/reject-comment.route';
import { FindPendingModerationRoute } from './routes/comment/moderate/pending-moderation.route';
import { CommentStatsRoute } from './routes/comment/stats/comment-stats.route';


// ✅ ADICIONAR - Comment Exception Filters
import { CommentNotFoundUsecaseExceptionFilterProvider } from './filters/usecases/comment/comment-not-found-usecase-exception.filter';
import { CommentAccessDeniedUsecaseExceptionFilterProvider } from './filters/usecases/comment/comment-access-denied-usecase-exception.filter';
import { CommentLimitReachedUsecaseExceptionFilterProvider } from './filters/usecases/comment/comment-limit-reached-usecase-exception.filter';
import { CommentModerationRequiredUsecaseExceptionFilterProvider } from './filters/usecases/comment/comment-moderation-required-usecase-exception.filter';

//
@Module({
  imports: [
    ServiceModule, 
    UsecaseModule,
  ],
  controllers: [
    // User routes
    CreateUserRoute,
    LoginUserRoute,
    RefreshAuthTokenRoute,
    FindByIdUserRoute,
    MeUserRoute,
    UserProvidersRoute,
    
    // GitHub auth routes
    StartGitHubAuthRoute,
    GitHubCallbackRoute,
    LinkGitHubAccountRoute,
    UnlinkGitHubAccountRoute,

    // Google auth routes
    StartGoogleAuthRoute,
    GoogleCallbackRoute,

    // Project routes
    CreateProjectRoute,
    CreateProjectMultipartRoute,
    FindProjectByIdRoute,
    ListProjectsRoute,
    MyProjectsRoute,
    DeleteProjectRoute,
    ListDeletedProjectsRoute,

    // Article routes (principais)
    CreateArticleRoute,
    FindArticleByIdRoute,
    FindArticleBySlugRoute,
    ListArticlesRoute,
    MyArticlesRoute,
    ModerateArticleRoute,
    PendingModerationRoute,

    // Article routes (extras)
    SearchArticlesRoute,
    ArticleStatsRoute,
    PopularTagsRoute,
    ApproveArticleRoute, // ✅ ADICIONAR
    RejectArticleRoute,  // ✅ ADICIONAR

    // ✅ NOTIFICATION ROUTES (NOVOS)
    FindNotificationsByUserRoute,
    MarkNotificationAsReadRoute,
    MarkAllNotificationsAsReadRoute,
    GetUnreadNotificationsCountRoute,
    NotificationStreamRoute, // SSE (opcional)
    WebSocketStatusRoute,    // Status do WebSocket

    // ✅ ADICIONAR - Comment Controllers
    CreateCommentRoute,
    ListCommentsRoute,
    FindRepliesRoute,
    UpdateCommentRoute,
    DeleteCommentRoute,
    CountCommentsRoute,
    ApproveCommentRoute,
    RejectCommentRoute,
    FindPendingModerationRoute,
    CommentStatsRoute,
  ],
  providers: [
    AuthGuardProvider,
    
    // ✅ ADICIONAR - Comment Exception Filters
    CommentNotFoundUsecaseExceptionFilterProvider,
    CommentAccessDeniedUsecaseExceptionFilterProvider,
    CommentLimitReachedUsecaseExceptionFilterProvider,
    CommentModerationRequiredUsecaseExceptionFilterProvider,

    // Domain exception filters
    ValidatorDomainExceptionFilterProvider,
    DomainExceptionFilterProvider,
    
    // General usecase exception filters
    UsecaseExceptionFilterProvider,
    
    // User exception filters
    CredentialsNotValidUsecaseExceptionFilterProvider,
    EmailAlreadyExistsUsecaseExceptionFilterProvider,
    UserNotFoundUsecaseExceptionFilterProvider,
    
    // Project exception filters
    ProjectNotFoundUsecaseExceptionFilterProvider,
    ProjectLimitReachedUsecaseExceptionFilterProvider,
    ProjectAccessDeniedUsecaseExceptionFilterProvider,

    // Article exception filters
    ArticleNotFoundUsecaseExceptionFilterProvider,
    ArticleLimitReachedUsecaseExceptionFilterProvider,
    ArticleAccessDeniedUsecaseExceptionFilterProvider,
    
    // Service exception filters
    ServiceExceptionFilterProvider,
    RefreshTokenNotValidServiceExceptionFilterProvider,
  ],
})
export class WebModule {}
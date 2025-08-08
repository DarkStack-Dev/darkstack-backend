// src/usecases/usecase.module.ts - ATUALIZADO COM NOTIFICAÇÕES
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
import { WebSocketModule } from '@/infra/websocket/websocket.module'; // ✅ NOVO

// Project use cases
import { CreateProjectsUseCase } from '@/domain/usecases/projects/create/create-projects.usecase';
import { ListProjectsUseCase } from '@/domain/usecases/projects/list/list-projects.usecase';
import { MyProjectsUseCase } from '@/domain/usecases/projects/my-projects/my-projects.usecase';
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

// Article use cases - Domain Layer
import { CreateArticleUseCase } from '@/domain/usecases/article/create/create-article.usecase';
import { FindArticleByIdUseCase } from '@/domain/usecases/article/find-by-id/find-article-by-id.usecase';
import { FindArticleBySlugUseCase } from '@/domain/usecases/article/find-by-slug/find-article-by-slug.usecase';
import { ListArticlesUseCase } from '@/domain/usecases/article/list/list-articles.usecase';
import { GetPendingModerationUseCase } from '@/domain/usecases/article/get-pending-moderation/get-pending-moderation.usecase';
import { SearchArticlesUseCase } from '@/domain/usecases/article/search/search-articles.usecase';
import { ArticleStatsUseCase } from '@/domain/usecases/article/stats/article-stats.usecase';
import { PopularTagsUseCase } from '@/domain/usecases/article/popular-tags/popular-tags.usecase';
import { ApproveArticleUseCase } from '@/domain/usecases/article/approve/approve-article.usecase';
import { RejectArticleUseCase } from '@/domain/usecases/article/reject/reject-article.usecase';

// Article use cases - Application Layer
import { CreateArticleUsecase } from './article/create/create-article.usecase';
import { FindArticleByIdUsecase } from './article/find-by-id/find-article-by-id.usecase';
import { FindArticleBySlugUsecase } from './article/find-by-slug/find-article-by-slug.usecase';
import { ListArticlesUsecase } from './article/list/list-articles.usecase';
import { MyArticlesUsecase } from './article/my-articles/my-articles.usecase';
import { ModerateArticleUsecase } from './article/moderate/moderate-article.usecase';
import { GetPendingModerationUsecase } from './article/get-pending-moderation/get-pending-moderation.usecase';
import { SearchArticlesUsecase } from './article/search/search-articles.usecase';
import { ArticleStatsUsecase } from './article/stats/article-stats.usecase';
import { PopularTagsUsecase } from './article/popular-tags/popular-tags.usecase';
import { ApproveArticleUsecase } from './article/approve/approve-article.usecase';
import { RejectArticleUsecase } from './article/reject/reject-article.usecase';

// ✅ NOTIFICATION USE CASES - Domain Layer
import { CreateNotificationUseCase } from '@/domain/usecases/notification/create/create-notification.usecase';
import { CreateManyNotificationsUseCase } from '@/domain/usecases/notification/create-many/create-many-notifications.usecase';
import { FindNotificationsByUserUseCase } from '@/domain/usecases/notification/find-by-user/find-notifications-by-user.usecase';
import { MarkNotificationAsReadUseCase } from '@/domain/usecases/notification/mark-as-read/mark-notification-as-read.usecase';
import { NotifyModeratorsUseCase } from '@/domain/usecases/notification/notify-moderators/notify-moderators.usecase';

// ✅ NOTIFICATION USE CASES - Application Layer
import { FindNotificationsByUserUsecase } from './notification/find-by-user/find-notifications-by-user.usecase';
import { MarkNotificationAsReadUsecase } from './notification/mark-as-read/mark-notification-as-read.usecase';
import { GetUnreadNotificationsCountUsecase } from './notification/get-unread-count/get-unread-notifications-count.usecase';
import { MarkAllNotificationsAsReadUsecase } from './notification/mark-all-read/mark-all-notifications-as-read.usecase';

// ✅ ADICIONAR - Comment Domain Use Cases
import { CreateCommentUseCase } from '@/domain/usecases/comment/create/create-comment.usecase';
import { ListCommentsUseCase } from '@/domain/usecases/comment/list/list-comments.usecase';
import { UpdateCommentUseCase } from '@/domain/usecases/comment/update/update-comment.usecase';
import { DeleteCommentUseCase } from '@/domain/usecases/comment/delete/delete-comment.usecase';

// ✅ ADICIONAR - Comment Application Use Cases
import { CreateCommentUsecase } from '@/usecases/comment/create/create-comment.usecase';
import { ListCommentsUsecase } from '@/usecases/comment/list/list-comments.usecase';
import { UpdateCommentUsecase } from '@/usecases/comment/update/update-comment.usecase';
import { DeleteCommentUsecase } from '@/usecases/comment/delete/delete-comment.usecase';
import { FindRepliesUsecase } from '@/usecases/comment/find-replies/find-replies.usecase';
import { CountCommentsUsecase } from '@/usecases/comment/count/count-comments.usecase';
import { ApproveCommentUsecase } from '@/usecases/comment/moderate/approve-comment.usecase';
import { RejectCommentUsecase } from '@/usecases/comment/moderate/reject-comment.usecase';
import { FindPendingModerationUsecase } from '@/usecases/comment/moderate/find-pending-moderation.usecase';
import { CommentStatsUsecase } from '@/usecases/comment/stats/comment-stats.usecase';

@Module({
  imports: [
    DatabaseModule, 
    ServiceModule,
    WebSocketModule, // ✅ NOVO: Para integração com WebSocket
  ],
  providers: [
    // User use cases
    CreateUserUsecase,
    FindUserUsecase,
    LoginUserUsecase,
    RefreshAuthTokenUserUsecase,
    UserProvidersUseCase,
    
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

    // Article use cases - Domain Layer
    CreateArticleUseCase,
    FindArticleByIdUseCase,
    FindArticleBySlugUseCase,
    ListArticlesUseCase,
    GetPendingModerationUseCase,
    SearchArticlesUseCase,
    ArticleStatsUseCase,
    PopularTagsUseCase,
    ApproveArticleUseCase, // ✅ ADICIONAR
    RejectArticleUseCase,  // ✅ ADICIONAR

    // Article use cases - Application Layer
    CreateArticleUsecase,
    FindArticleByIdUsecase,
    FindArticleBySlugUsecase,
    ListArticlesUsecase,
    MyArticlesUsecase,
    ModerateArticleUsecase,
    GetPendingModerationUsecase,
    SearchArticlesUsecase,
    ArticleStatsUsecase,
    PopularTagsUsecase,
    ApproveArticleUsecase, // ✅ ADICIONAR
    RejectArticleUsecase,  // ✅ ADICIONAR

    // ✅ NOTIFICATION USE CASES - Domain Layer
    CreateNotificationUseCase,
    CreateManyNotificationsUseCase,
    FindNotificationsByUserUseCase,
    MarkNotificationAsReadUseCase,
    NotifyModeratorsUseCase,

    // ✅ NOTIFICATION USE CASES - Application Layer
    FindNotificationsByUserUsecase,
    MarkNotificationAsReadUsecase,
    GetUnreadNotificationsCountUsecase,
    MarkAllNotificationsAsReadUsecase,

    // ✅ ADICIONAR - Comment Domain Use Cases
    CreateCommentUseCase,
    ListCommentsUseCase,
    UpdateCommentUseCase,
    DeleteCommentUseCase,

    // ✅ ADICIONAR - Comment Application Use Cases
    CreateCommentUsecase,
    ListCommentsUsecase,
    UpdateCommentUsecase,
    DeleteCommentUsecase,
    FindRepliesUsecase,
    CountCommentsUsecase,
    ApproveCommentUsecase,
    RejectCommentUsecase,
    FindPendingModerationUsecase,
    CommentStatsUsecase,
  ],
  exports: [
    // User use cases
    CreateUserUsecase,
    FindUserUsecase,
    LoginUserUsecase,
    RefreshAuthTokenUserUsecase,
    UserProvidersUseCase,
    
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

    // Article use cases - Domain Layer
    CreateArticleUseCase,
    FindArticleByIdUseCase,
    FindArticleBySlugUseCase,
    ListArticlesUseCase,
    GetPendingModerationUseCase,
    SearchArticlesUseCase,
    ArticleStatsUseCase,
    PopularTagsUseCase,
    ApproveArticleUseCase, // ✅ ADICIONAR
    RejectArticleUseCase,  // ✅ ADICIONAR

    // Article use cases - Application Layer
    CreateArticleUsecase,
    FindArticleByIdUsecase,
    FindArticleBySlugUsecase,
    ListArticlesUsecase,
    MyArticlesUsecase,
    ModerateArticleUsecase,
    GetPendingModerationUsecase,
    SearchArticlesUsecase,
    ArticleStatsUsecase,
    PopularTagsUsecase,
    ApproveArticleUsecase, // ✅ ADICIONAR
    RejectArticleUsecase,  // ✅ ADICIONAR

    // ✅ NOTIFICATION USE CASES - Domain Layer
    CreateNotificationUseCase,
    CreateManyNotificationsUseCase,
    FindNotificationsByUserUseCase,
    MarkNotificationAsReadUseCase,
    NotifyModeratorsUseCase,

    // ✅ NOTIFICATION USE CASES - Application Layer
    FindNotificationsByUserUsecase,
    MarkNotificationAsReadUsecase,
    GetUnreadNotificationsCountUsecase,
    MarkAllNotificationsAsReadUsecase,

    // ✅ ADICIONAR - Export Comment Domain Use Cases
    CreateCommentUseCase,
    ListCommentsUseCase,
    UpdateCommentUseCase,
    DeleteCommentUseCase,

    // ✅ ADICIONAR - Export Comment Application Use Cases
    CreateCommentUsecase,
    ListCommentsUsecase,
    UpdateCommentUsecase,
    DeleteCommentUsecase,
    FindRepliesUsecase,
    CountCommentsUsecase,
    ApproveCommentUsecase,
    RejectCommentUsecase,
    FindPendingModerationUsecase,
    CommentStatsUsecase,
  ],
})
export class UsecaseModule {}
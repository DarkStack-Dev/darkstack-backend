# Estrutura do Projeto: darkstack

**Data de geração:** 05/08/2025 02:58:44

**Estatísticas:**
- 📁 Diretórios: 270
- 📄 Arquivos: 415

## 🌳 Estrutura de Arquivos

```
.env
README.md
docker-compose.yml
estrutura_detalhada.md
estrutura_projeto.md
generated\prisma\client.d.ts
generated\prisma\client.js
generated\prisma\default.d.ts
generated\prisma\default.js
generated\prisma\edge.d.ts
generated\prisma\edge.js
generated\prisma\index-browser.js
generated\prisma\index.d.ts
generated\prisma\index.js
generated\prisma\package.json
generated\prisma\runtime\edge-esm.js
generated\prisma\runtime\edge.js
generated\prisma\runtime\index-browser.d.ts
generated\prisma\runtime\index-browser.js
generated\prisma\runtime\library.d.ts
generated\prisma\runtime\library.js
generated\prisma\runtime\react-native.js
generated\prisma\runtime\wasm-compiler-edge.js
generated\prisma\runtime\wasm-engine-edge.js
generated\prisma\wasm.d.ts
generated\prisma\wasm.js
nest-cli.json
package-lock.json
package.json
src\app.controller.spec.ts
src\app.controller.ts
src\app.module.ts
src\app.service.ts
src\domain\entities\article\article.entity.ts
src\domain\entities\comment\comment.entity.ts
src\domain\entities\github-account\github-account.entity.ts
src\domain\entities\google-account\google-account.entity.ts
src\domain\entities\notification\notification.entity.ts
src\domain\entities\projects\projects.entity.ts
src\domain\entities\user\user.entitty.ts
src\domain\factories\comment\comment.validator.factory.ts
src\domain\factories\github-account\github-account.validator.factory.ts
src\domain\factories\notification\notification.validator.factory.ts
src\domain\factories\projects\projects.validator.factory.ts
src\domain\factories\user\user-password.validator.factory.ts
src\domain\factories\user\user.validator.factory.ts
src\domain\repositories\article\article.gateway.repository.ts
src\domain\repositories\comment\comment.gateway.repository.ts
src\domain\repositories\github-account\github-account.gateway.repository.ts
src\domain\repositories\google-account\google-account.gateway.repository.ts
src\domain\repositories\notification\notification.gateway.repository.ts
src\domain\repositories\projects\projects.gateway.repository.ts
src\domain\repositories\user\user.gateway.repository.ts
src\domain\shared\entities\entity.ts
src\domain\shared\exceptions\domain.exception.ts
src\domain\shared\exceptions\validator-domain.exception.ts
src\domain\shared\validators\validator.ts
src\domain\usecases\article\approve\approve-article.usecase.ts
src\domain\usecases\article\business_rules.md
src\domain\usecases\article\clean_arch.MD
src\domain\usecases\article\comandos.md
src\domain\usecases\article\create\create-article.usecase.ts
src\domain\usecases\article\docs.md
src\domain\usecases\article\find-by-id\find-article-by-id.usecase.ts
src\domain\usecases\article\find-by-slug\find-article-by-slug.usecase.ts
src\domain\usecases\article\get-pending-moderation\get-pending-moderation.usecase.ts
src\domain\usecases\article\list\list-articles.usecase.ts
src\domain\usecases\article\new_usecase.MD
src\domain\usecases\article\popular-tags\popular-tags.usecase.ts
src\domain\usecases\article\postman.MD
src\domain\usecases\article\reject\reject-article.usecase.ts
src\domain\usecases\article\search\search-articles.usecase.ts
src\domain\usecases\article\stats\article-stats.usecase.ts
src\domain\usecases\article\usePostman.md
src\domain\usecases\comment\create\create-comment.usecase.ts
src\domain\usecases\comment\delete\delete-comment.usecase.ts
src\domain\usecases\comment\docs_v1.md
src\domain\usecases\comment\list\list-comments.usecase.ts
src\domain\usecases\comment\update\update-comment.usecase.ts
src\domain\usecases\exceptions\article\article-not-found.usecase.exception.ts
src\domain\usecases\exceptions\auth\unauthorized.usecase.exception.ts
src\domain\usecases\exceptions\comment\comment-access-denied.usecase.exception.ts
src\domain\usecases\exceptions\comment\comment-limit-reached.usecase.exception.ts
src\domain\usecases\exceptions\comment\comment-moderation-required.usecase.exception.ts
src\domain\usecases\exceptions\comment\comment-not-found.usecase.exception.ts
src\domain\usecases\exceptions\email\email-already-exists.usecase.exception.ts
src\domain\usecases\exceptions\input\invalid-input.usecase.exception.ts
src\domain\usecases\exceptions\notification\notification-not-found.usecase.exception.ts
src\domain\usecases\exceptions\usecase.exception.ts
src\domain\usecases\exceptions\user\credentials-not-valid.usecase.exception.ts
src\domain\usecases\exceptions\user\user-not-found.usecase.exception.ts
src\domain\usecases\github-auth\github-callback\github-callback.usecase.ts
src\domain\usecases\github-auth\link-github-account\link-github-account.usecase.ts
src\domain\usecases\github-auth\start-github-auth\start-github-auth.usecase.ts
src\domain\usecases\github-auth\unlink-github-account\unlink-github-account.usecase.ts
src\domain\usecases\google-auth\google-callback\google-callback.usecase.ts
src\domain\usecases\google-auth\start-google-auth\start-google-auth.usecase.ts
src\domain\usecases\notification\create-many\create-many-notifications.usecase.ts
src\domain\usecases\notification\create\create-notification.usecase.ts
src\domain\usecases\notification\docs_v1.MD
src\domain\usecases\notification\docs_v2.MD
src\domain\usecases\notification\find-by-user\find-notifications-by-user.usecase.ts
src\domain\usecases\notification\mark-as-read\mark-notification-as-read.usecase.ts
src\domain\usecases\notification\notify-moderators\notify-moderators.usecase.ts
src\domain\usecases\projects\approve\approve-project.usecase.ts
src\domain\usecases\projects\create\create-projects.usecase.ts
src\domain\usecases\projects\delete\delete-project.usecase.ts
src\domain\usecases\projects\find-by-id\find-project-by-id.usecase.ts
src\domain\usecases\projects\list-deleted\list-deleted-projects.usecase.ts
src\domain\usecases\projects\list\list-projects.usecase.ts
src\domain\usecases\projects\my-projects\my-projects.usecase.ts
src\domain\usecases\projects\restore\restore-project.usecase.ts
src\domain\usecases\projects\update\update-project.usecase.ts
src\domain\usecases\providers\user-providers.usecase.ts
src\domain\usecases\usecase.module.ts
src\domain\usecases\usecase.ts
src\domain\usecases\user\admin-update\admin-update-user.usecase.ts
src\domain\usecases\user\create\create-user.usecase.ts
src\domain\usecases\user\find-by-id\find-user.usecase.ts
src\domain\usecases\user\list-users\list-users.usecase.ts
src\domain\usecases\user\moderator-update\moderator-update-user.usecase.ts
src\domain\usecases\user\refresh-auth-token\refresh-auth-token-user.usecase.ts
src\domain\usecases\user\signin\signin-user.usecase.ts
src\domain\usecases\user\update-profile\update-user-profile.usecase.ts
src\domain\validators\article\article.validator.factory.ts
src\domain\validators\article\article.zod.validator.ts
src\domain\validators\comment\comment.zod.validator.ts
src\domain\validators\github-account\github-account.zod.validator.ts
src\domain\validators\notification\notification.zod.validator.ts
src\domain\validators\projects\projects.zod.validator.ts
src\domain\validators\user\user-password.zod.validator.ts
src\domain\validators\user\user.zod.validator.ts
src\infra\repositories\database.module.ts
src\infra\repositories\prisma\article\article.prisma.repository.provider.ts
src\infra\repositories\prisma\article\article.prisma.repository.ts
src\infra\repositories\prisma\article\model\mappers\article-entity-to-prisma-model.mapper.ts
src\infra\repositories\prisma\article\model\mappers\article-prisma-model-to-entity.mapper.ts
src\infra\repositories\prisma\client.prisma.ts
src\infra\repositories\prisma\comment\comment.prisma.repository.provider.ts
src\infra\repositories\prisma\comment\comment.prisma.repository.ts
src\infra\repositories\prisma\comment\model\mappers\comment-entity-to-prisma-model.mapper.ts
src\infra\repositories\prisma\comment\model\mappers\comment-prisma-model-to-entity.mapper.ts
src\infra\repositories\prisma\github-account\github-account.prisma.repository.provider.ts
src\infra\repositories\prisma\github-account\github-account.prisma.repository.ts
src\infra\repositories\prisma\github-account\model\github-account.prisma.model.ts
src\infra\repositories\prisma\github-account\model\mappers\github-account-entity-to-prisma-model.mapper.ts
src\infra\repositories\prisma\github-account\model\mappers\github-account-prisma-model-to-entity.mapper.ts
src\infra\repositories\prisma\google-account\google-account.prisma.repository.provider.ts
src\infra\repositories\prisma\google-account\google-account.prisma.repository.ts
src\infra\repositories\prisma\notification\model\mappers\notification-entity-to-prisma-model.mapper.ts
src\infra\repositories\prisma\notification\model\mappers\notification-prisma-model-to-entity.mapper.ts
src\infra\repositories\prisma\notification\notification.prisma.repository.provider.ts
src\infra\repositories\prisma\notification\notification.prisma.repository.ts
src\infra\repositories\prisma\projects\model\projects-entity-to-projects-prisma-model.mapper.ts
src\infra\repositories\prisma\projects\model\projects-prisma-model-to-projects-entity.mapper.ts
src\infra\repositories\prisma\projects\model\projects-relation-helper.mapper.ts
src\infra\repositories\prisma\projects\model\projects-to-admin.mapper.ts
src\infra\repositories\prisma\projects\model\projects-to-response.mapper.ts
src\infra\repositories\prisma\projects\projects.prisma.repository.provider.ts
src\infra\repositories\prisma\projects\projects.prisma.repository.ts
src\infra\repositories\prisma\user\model\mappers\user-entity-to-user-prisma-model.mapper.ts
src\infra\repositories\prisma\user\model\mappers\user-prisma-model-to-user-entity.mapper.ts
src\infra\repositories\prisma\user\model\user.prisma.model.ts
src\infra\repositories\prisma\user\user.prisma.repository.provider.ts
src\infra\repositories\prisma\user\user.prisma.repository.ts
src\infra\services\exceptions\jsonwebtoken\auth-token-not-valid.service.exception.ts
src\infra\services\exceptions\jsonwebtoken\refresh-token-not-valid.service.exception.ts
src\infra\services\exceptions\service.exception.ts
src\infra\services\github\github-api\github-api.service.provider.ts
src\infra\services\github\github-api\github-api.service.ts
src\infra\services\github\github.service.provider.ts
src\infra\services\github\github.service.ts
src\infra\services\github\types.ts
src\infra\services\google\google-api\google-api.service.provider.ts
src\infra\services\google\google-api\google-api.service.ts
src\infra\services\image-upload\image-upload.service.ts
src\infra\services\jwt\jsonwebtoken\jsonwebtoken.jwt.service.provider.ts
src\infra\services\jwt\jsonwebtoken\jsonwebtoken.jwt.service.ts
src\infra\services\jwt\jwt.service.ts
src\infra\services\notification\notification-stream.service.ts
src\infra\services\service.module.ts
src\infra\services\storage\railway\railway-storage.service.provider.ts
src\infra\services\storage\railway\railway-storage.service.ts
src\infra\services\storage\storage.service.ts
src\infra\web\auth\auth.guards.ts
src\infra\web\auth\decorators\is-public.decorator.ts
src\infra\web\auth\decorators\roles.decorator.ts
src\infra\web\filters\domain\domain-exception.filter.ts
src\infra\web\filters\domain\validator-domain-exception.filter.ts
src\infra\web\filters\infra\services\refresh-token-not-valid-service-exception.filter.ts
src\infra\web\filters\infra\services\service-exception.filter.ts
src\infra\web\filters\multer-exception.filter.ts
src\infra\web\filters\usecases\article\article-access-denied-usecase-exception.filter.ts
src\infra\web\filters\usecases\article\article-limit-reached-usecase-exception.filter.ts
src\infra\web\filters\usecases\article\article-not-found-usecase-exception.filter.ts
src\infra\web\filters\usecases\comment\comment-access-denied-usecase-exception.filter.ts
src\infra\web\filters\usecases\comment\comment-limit-reached-usecase-exception.filter.ts
src\infra\web\filters\usecases\comment\comment-moderation-required-usecase-exception.filter.ts
src\infra\web\filters\usecases\comment\comment-not-found-usecase-exception.filter.ts
src\infra\web\filters\usecases\credentials-not-valid-usecase-exception.filter.ts
src\infra\web\filters\usecases\email-already-exists-usecase-exception.filter.ts
src\infra\web\filters\usecases\projects\project-access-denied-usecase-exception.filter.ts
src\infra\web\filters\usecases\projects\project-limit-reached-usecase-exception.filter.ts
src\infra\web\filters\usecases\projects\project-not-found-usecase-exception.filter.ts
src\infra\web\filters\usecases\usecase-exception.filter.ts
src\infra\web\filters\usecases\user-not-found-usecase-exception.filter.ts
src\infra\web\middleware\article-rate-limit.middleware.ts
src\infra\web\routes\article\create\create-article.dto.ts
src\infra\web\routes\article\create\create-article.presenter.ts
src\infra\web\routes\article\create\create-article.route.ts
src\infra\web\routes\article\find-by-id\find-article-by-id.dto.ts
src\infra\web\routes\article\find-by-id\find-article-by-id.presenter.ts
src\infra\web\routes\article\find-by-id\find-article-by-id.route.ts
src\infra\web\routes\article\find-by-slug\find-article-by-slug.route.ts
src\infra\web\routes\article\list\list-articles.dto.ts
src\infra\web\routes\article\list\list-articles.presenter.ts
src\infra\web\routes\article\list\list-articles.route.ts
src\infra\web\routes\article\moderate\approve-article.route.ts
src\infra\web\routes\article\moderate\moderate-article.dto.ts
src\infra\web\routes\article\moderate\moderate-article.presenter.ts
src\infra\web\routes\article\moderate\moderate-article.route.ts
src\infra\web\routes\article\moderate\pending-articles.route.ts
src\infra\web\routes\article\moderate\reject-article.route.ts
src\infra\web\routes\article\my-articles\my-articles.dto.ts
src\infra\web\routes\article\my-articles\my-articles.presenter.ts
src\infra\web\routes\article\my-articles\my-articles.route.ts
src\infra\web\routes\article\pending-moderation\pending-moderation.presenter.ts
src\infra\web\routes\article\pending-moderation\pending-moderation.route.ts
src\infra\web\routes\article\search\search-articles.route.ts
src\infra\web\routes\article\stats\article-stats.route.ts
src\infra\web\routes\article\tags\popular-tags.route.ts
src\infra\web\routes\auth\github-auth\github-auth.route.ts
src\infra\web\routes\comment\count\count-comments.dto.ts
src\infra\web\routes\comment\count\count-comments.presenter.ts
src\infra\web\routes\comment\count\count-comments.route.ts
src\infra\web\routes\comment\create\create-comment.dto.ts
src\infra\web\routes\comment\create\create-comment.presenter.ts
src\infra\web\routes\comment\create\create-comment.route.ts
src\infra\web\routes\comment\delete\delete-comment.dto.ts
src\infra\web\routes\comment\delete\delete-comment.presenter.ts
src\infra\web\routes\comment\delete\delete-comment.route.ts
src\infra\web\routes\comment\find-replies\find-replies.dto.ts
src\infra\web\routes\comment\find-replies\find-replies.presenter.ts
src\infra\web\routes\comment\find-replies\find-replies.route.ts
src\infra\web\routes\comment\list\list-comments.dto.ts
src\infra\web\routes\comment\list\list-comments.presenter.ts
src\infra\web\routes\comment\list\list-comments.route.ts
src\infra\web\routes\comment\moderate\approve-comment.dto.ts
src\infra\web\routes\comment\moderate\approve-comment.presenter.ts
src\infra\web\routes\comment\moderate\approve-comment.route.ts
src\infra\web\routes\comment\moderate\find-pending-moderation.dto.ts
src\infra\web\routes\comment\moderate\find-pending-moderation.presenter.ts
src\infra\web\routes\comment\moderate\pending-moderation.route.ts
src\infra\web\routes\comment\moderate\reject-comment.dto.ts
src\infra\web\routes\comment\moderate\reject-comment.presenter.ts
src\infra\web\routes\comment\moderate\reject-comment.route.ts
src\infra\web\routes\comment\stats\comment-stats.dto.ts
src\infra\web\routes\comment\stats\comment-stats.presenter.ts
src\infra\web\routes\comment\stats\comment-stats.route.ts
src\infra\web\routes\comment\update\update-comment.dto.ts
src\infra\web\routes\comment\update\update-comment.presenter.ts
src\infra\web\routes\comment\update\update-comment.route.ts
src\infra\web\routes\github-auth\callback\github-callback.dto.ts
src\infra\web\routes\github-auth\callback\github-callback.presenter.ts
src\infra\web\routes\github-auth\callback\github-callback.route.ts
src\infra\web\routes\github-auth\link\link-github-account.dto.ts
src\infra\web\routes\github-auth\link\link-github-account.presenter.ts
src\infra\web\routes\github-auth\link\link-github-account.route.ts
src\infra\web\routes\github-auth\start\start-github-auth.dto.ts
src\infra\web\routes\github-auth\start\start-github-auth.presenter.ts
src\infra\web\routes\github-auth\start\start-github-auth.route.ts
src\infra\web\routes\github-auth\unlink\unlink-github-account.dto.ts
src\infra\web\routes\github-auth\unlink\unlink-github-account.presenter.ts
src\infra\web\routes\github-auth\unlink\unlink-github-account.route.ts
src\infra\web\routes\google-auth\callback\google-callback.dto.ts
src\infra\web\routes\google-auth\callback\google-callback.presenter.ts
src\infra\web\routes\google-auth\callback\google-callback.route.ts
src\infra\web\routes\google-auth\start\start-google-auth.dto.ts
src\infra\web\routes\google-auth\start\start-google-auth.presenter.ts
src\infra\web\routes\google-auth\start\start-google-auth.route.ts
src\infra\web\routes\notification\find-by-user\find-notifications-by-user.dto.ts
src\infra\web\routes\notification\find-by-user\find-notifications-by-user.presenter.ts
src\infra\web\routes\notification\find-by-user\find-notifications-by-user.route.ts
src\infra\web\routes\notification\get-unread-count\get-unread-count.route.ts
src\infra\web\routes\notification\mark-all-read\mark-all-read.route.ts
src\infra\web\routes\notification\mark-as-read\mark-notification-as-read.route.ts
src\infra\web\routes\notification\stream\notification-stream.route.ts
src\infra\web\routes\notification\websocket-status\websocket-status.route.ts
src\infra\web\routes\projects\approve\approve-project.dto.ts
src\infra\web\routes\projects\approve\approve-project.presenter.ts
src\infra\web\routes\projects\approve\approve-project.route.ts
src\infra\web\routes\projects\create\create-project-multipart.dto.ts
src\infra\web\routes\projects\create\create-project-multipart.presenter.ts
src\infra\web\routes\projects\create\create-project-multipart.route.ts
src\infra\web\routes\projects\create\create-project.dto.ts
src\infra\web\routes\projects\create\create-project.presenter.ts
src\infra\web\routes\projects\create\create-project.route.ts
src\infra\web\routes\projects\delete\delete-project.dto.ts
src\infra\web\routes\projects\delete\delete-project.presenter.ts
src\infra\web\routes\projects\delete\delete-project.route.ts
src\infra\web\routes\projects\find-by-id\find-project-by-id.dto.ts
src\infra\web\routes\projects\find-by-id\find-project-by-id.presenter.ts
src\infra\web\routes\projects\find-by-id\find-project-by-id.route.ts
src\infra\web\routes\projects\list-deleted\list-deleted-projects.route.ts
src\infra\web\routes\projects\list\list-projects.dto.ts
src\infra\web\routes\projects\list\list-projects.presenter.ts
src\infra\web\routes\projects\list\list-projects.route.ts
src\infra\web\routes\projects\my-projects\my-projects.dto.ts
src\infra\web\routes\projects\my-projects\my-projects.presenter.ts
src\infra\web\routes\projects\my-projects\my-projects.route.ts
src\infra\web\routes\projects\update\update-project.dto.ts
src\infra\web\routes\projects\update\update-project.presenter.ts
src\infra\web\routes\projects\update\update-project.route.ts
src\infra\web\routes\user\admin-update\admin-update-user.dto.ts
src\infra\web\routes\user\admin-update\admin-update-user.presenter.ts
src\infra\web\routes\user\admin-update\admin-update-user.route.ts
src\infra\web\routes\user\create\create-user.dto.ts
src\infra\web\routes\user\create\create-user.presenter.ts
src\infra\web\routes\user\create\create-user.route.ts
src\infra\web\routes\user\find-by-id\find-by-id-user.dto.ts
src\infra\web\routes\user\find-by-id\find-by-id-user.presenter.ts
src\infra\web\routes\user\find-by-id\find-by-id-user.route.ts
src\infra\web\routes\user\list-users\list-users.dto.ts
src\infra\web\routes\user\list-users\list-users.presenter.ts
src\infra\web\routes\user\list-users\list-users.route.ts
src\infra\web\routes\user\login\login-user.dto.ts
src\infra\web\routes\user\login\login-user.presenter.ts
src\infra\web\routes\user\login\login-user.route.ts
src\infra\web\routes\user\me\me-user.dto.ts
src\infra\web\routes\user\me\me-user.presenter.ts
src\infra\web\routes\user\me\me-user.route.ts
src\infra\web\routes\user\moderator-update\moderator-update-user.dto.ts
src\infra\web\routes\user\moderator-update\moderator-update-user.presenter.ts
src\infra\web\routes\user\moderator-update\moderator-update-user.route.ts
src\infra\web\routes\user\providers\user-providers.route.ts
src\infra\web\routes\user\refresh-auth-token\refresh-auth-token.dto.ts
src\infra\web\routes\user\refresh-auth-token\refresh-auth-token.presenter.ts
src\infra\web\routes\user\refresh-auth-token\refresh-auth-token.route.ts
src\infra\web\routes\user\update-profile\update-user-profile.dto.ts
src\infra\web\routes\user\update-profile\update-user-profile.presenter.ts
src\infra\web\routes\user\update-profile\update-user-profile.route.ts
src\infra\web\web.module.ts
src\infra\websocket\notification.gateway.ts
src\infra\websocket\websocket.module.ts
src\main.ts
src\shared\exceptions\exception.ts
src\shared\utils\exception-utils.ts
src\shared\utils\log-utils.ts
src\shared\utils\utils.ts
src\shared\utils\zod-utils.ts
src\usecases\article\approve\approve-article.usecase.ts
src\usecases\article\create\create-article.usecase.ts
src\usecases\article\find-by-id\find-article-by-id.usecase.ts
src\usecases\article\find-by-slug\find-article-by-slug.usecase.ts
src\usecases\article\get-pending-moderation\get-pending-moderation.usecase.ts
src\usecases\article\list\list-articles.usecase.ts
src\usecases\article\moderate\moderate-article.usecase.ts
src\usecases\article\my-articles\my-articles.usecase.ts
src\usecases\article\popular-tags\popular-tags.usecase.ts
src\usecases\article\reject\reject-article.usecase.ts
src\usecases\article\search\search-articles.usecase.ts
src\usecases\article\stats\article-stats.usecase.ts
src\usecases\comment\count\count-comments.usecase.ts
src\usecases\comment\create\create-comment.usecase.ts
src\usecases\comment\delete\delete-comment.usecase.ts
src\usecases\comment\find-replies\find-replies.usecase.ts
src\usecases\comment\list\list-comments.usecase.ts
src\usecases\comment\moderate\approve-comment.usecase.ts
src\usecases\comment\moderate\find-pending-moderation.usecase.ts
src\usecases\comment\moderate\reject-comment.usecase.ts
src\usecases\comment\stats\comment-stats.usecase.ts
src\usecases\comment\update\update-comment.usecase.ts
src\usecases\exceptions\article\article-not-found.usecase.exception.ts
src\usecases\exceptions\comment\comment-access-denied.usecase.exception.ts
src\usecases\exceptions\comment\comment-limit-reached.usecase.exception.ts
src\usecases\exceptions\comment\comment-moderation-required.usecase.exception.ts
src\usecases\exceptions\comment\comment-not-found.usecase.exception.ts
src\usecases\exceptions\credentials-not-valid.usecase.exception.ts
src\usecases\exceptions\email-already-exists.usecase.exception.ts
src\usecases\exceptions\input\invalid-input.usecase.exception.ts
src\usecases\exceptions\projects\project-access-denied.usecase.exception.ts
src\usecases\exceptions\projects\project-limit-reached.usecase.exception.ts
src\usecases\exceptions\projects\project-not-found.usecase.exception.ts
src\usecases\exceptions\projects\projects-aumont-limit-reached.usecase.exceptions.ts
src\usecases\exceptions\usecase.exception.ts
src\usecases\exceptions\user\user-not-found.usecase.exception.ts
src\usecases\moderation\find-pending-articles\find-pending-articles.usecase.ts
src\usecases\notification\find-by-user\find-notifications-by-user.usecase.ts
src\usecases\notification\get-unread-count\get-unread-notifications-count.usecase.ts
src\usecases\notification\mark-all-read\mark-all-notifications-as-read.usecase.ts
src\usecases\notification\mark-as-read\mark-notification-as-read.usecase.ts
src\usecases\projects\approve\approve-project.usecase.ts
src\usecases\projects\create\create-project.usecase.ts
src\usecases\projects\delete\delete-project.usecase.ts
src\usecases\projects\find-by-id\find-project-by-id.usecase.ts
src\usecases\projects\list-deleted\list-deleted-projects.usecase.ts
src\usecases\projects\list\list-projects.usecase.ts
src\usecases\projects\my-projects\my-projects.usecase.ts
src\usecases\projects\restore\restore-project.usecase.ts
src\usecases\projects\update\update-project.usecase.ts
src\usecases\usecase.module.ts
src\usecases\usecase.ts
src\usecases\user\admin-update\admin-update-user.usecase.ts
src\usecases\user\create\create-user.usecase.ts
src\usecases\user\find-by-id\find-user.usecase.ts
src\usecases\user\list-users\list-users.usecase.ts
src\usecases\user\login\login-user.usecase.ts
src\usecases\user\me\me-user.usecase.ts
src\usecases\user\moderator-update\moderator-update-user.usecase.ts
src\usecases\user\refresh-auth-token\refresh-auth-token-user.usecase.ts
src\usecases\user\update-profile\update-user-profile.usecase.ts
test\app.e2e-spec.ts
test\jest-e2e.json
tsconfig.build.json
tsconfig.json
```

## 📋 Arquivos por Categoria

### TypeScript

- `.env`
- `generated\prisma\client.d.ts`
- `generated\prisma\default.d.ts`
- `generated\prisma\edge.d.ts`
- `generated\prisma\index.d.ts`
- `generated\prisma\runtime\index-browser.d.ts`
- `generated\prisma\runtime\library.d.ts`
- `generated\prisma\wasm.d.ts`
- `src\app.controller.spec.ts`
- `src\app.controller.ts`
- `src\app.module.ts`
- `src\app.service.ts`
- `src\domain\entities\article\article.entity.ts`
- `src\domain\entities\comment\comment.entity.ts`
- `src\domain\entities\github-account\github-account.entity.ts`
- `src\domain\entities\google-account\google-account.entity.ts`
- `src\domain\entities\notification\notification.entity.ts`
- `src\domain\entities\projects\projects.entity.ts`
- `src\domain\entities\user\user.entitty.ts`
- `src\domain\factories\comment\comment.validator.factory.ts`
- `src\domain\factories\github-account\github-account.validator.factory.ts`
- `src\domain\factories\notification\notification.validator.factory.ts`
- `src\domain\factories\projects\projects.validator.factory.ts`
- `src\domain\factories\user\user-password.validator.factory.ts`
- `src\domain\factories\user\user.validator.factory.ts`
- `src\domain\repositories\article\article.gateway.repository.ts`
- `src\domain\repositories\comment\comment.gateway.repository.ts`
- `src\domain\repositories\github-account\github-account.gateway.repository.ts`
- `src\domain\repositories\google-account\google-account.gateway.repository.ts`
- `src\domain\repositories\notification\notification.gateway.repository.ts`
- `src\domain\repositories\projects\projects.gateway.repository.ts`
- `src\domain\repositories\user\user.gateway.repository.ts`
- `src\domain\shared\entities\entity.ts`
- `src\domain\shared\exceptions\domain.exception.ts`
- `src\domain\shared\exceptions\validator-domain.exception.ts`
- `src\domain\shared\validators\validator.ts`
- `src\domain\usecases\article\approve\approve-article.usecase.ts`
- `src\domain\usecases\article\create\create-article.usecase.ts`
- `src\domain\usecases\article\find-by-id\find-article-by-id.usecase.ts`
- `src\domain\usecases\article\find-by-slug\find-article-by-slug.usecase.ts`
- `src\domain\usecases\article\get-pending-moderation\get-pending-moderation.usecase.ts`
- `src\domain\usecases\article\list\list-articles.usecase.ts`
- `src\domain\usecases\article\popular-tags\popular-tags.usecase.ts`
- `src\domain\usecases\article\reject\reject-article.usecase.ts`
- `src\domain\usecases\article\search\search-articles.usecase.ts`
- `src\domain\usecases\article\stats\article-stats.usecase.ts`
- `src\domain\usecases\comment\create\create-comment.usecase.ts`
- `src\domain\usecases\comment\delete\delete-comment.usecase.ts`
- `src\domain\usecases\comment\list\list-comments.usecase.ts`
- `src\domain\usecases\comment\update\update-comment.usecase.ts`
- `src\domain\usecases\exceptions\article\article-not-found.usecase.exception.ts`
- `src\domain\usecases\exceptions\auth\unauthorized.usecase.exception.ts`
- `src\domain\usecases\exceptions\comment\comment-access-denied.usecase.exception.ts`
- `src\domain\usecases\exceptions\comment\comment-limit-reached.usecase.exception.ts`
- `src\domain\usecases\exceptions\comment\comment-moderation-required.usecase.exception.ts`
- `src\domain\usecases\exceptions\comment\comment-not-found.usecase.exception.ts`
- `src\domain\usecases\exceptions\email\email-already-exists.usecase.exception.ts`
- `src\domain\usecases\exceptions\input\invalid-input.usecase.exception.ts`
- `src\domain\usecases\exceptions\notification\notification-not-found.usecase.exception.ts`
- `src\domain\usecases\exceptions\usecase.exception.ts`
- `src\domain\usecases\exceptions\user\credentials-not-valid.usecase.exception.ts`
- `src\domain\usecases\exceptions\user\user-not-found.usecase.exception.ts`
- `src\domain\usecases\github-auth\github-callback\github-callback.usecase.ts`
- `src\domain\usecases\github-auth\link-github-account\link-github-account.usecase.ts`
- `src\domain\usecases\github-auth\start-github-auth\start-github-auth.usecase.ts`
- `src\domain\usecases\github-auth\unlink-github-account\unlink-github-account.usecase.ts`
- `src\domain\usecases\google-auth\google-callback\google-callback.usecase.ts`
- `src\domain\usecases\google-auth\start-google-auth\start-google-auth.usecase.ts`
- `src\domain\usecases\notification\create-many\create-many-notifications.usecase.ts`
- `src\domain\usecases\notification\create\create-notification.usecase.ts`
- `src\domain\usecases\notification\find-by-user\find-notifications-by-user.usecase.ts`
- `src\domain\usecases\notification\mark-as-read\mark-notification-as-read.usecase.ts`
- `src\domain\usecases\notification\notify-moderators\notify-moderators.usecase.ts`
- `src\domain\usecases\projects\approve\approve-project.usecase.ts`
- `src\domain\usecases\projects\create\create-projects.usecase.ts`
- `src\domain\usecases\projects\delete\delete-project.usecase.ts`
- `src\domain\usecases\projects\find-by-id\find-project-by-id.usecase.ts`
- `src\domain\usecases\projects\list-deleted\list-deleted-projects.usecase.ts`
- `src\domain\usecases\projects\list\list-projects.usecase.ts`
- `src\domain\usecases\projects\my-projects\my-projects.usecase.ts`
- `src\domain\usecases\projects\restore\restore-project.usecase.ts`
- `src\domain\usecases\projects\update\update-project.usecase.ts`
- `src\domain\usecases\providers\user-providers.usecase.ts`
- `src\domain\usecases\usecase.module.ts`
- `src\domain\usecases\usecase.ts`
- `src\domain\usecases\user\admin-update\admin-update-user.usecase.ts`
- `src\domain\usecases\user\create\create-user.usecase.ts`
- `src\domain\usecases\user\find-by-id\find-user.usecase.ts`
- `src\domain\usecases\user\list-users\list-users.usecase.ts`
- `src\domain\usecases\user\moderator-update\moderator-update-user.usecase.ts`
- `src\domain\usecases\user\refresh-auth-token\refresh-auth-token-user.usecase.ts`
- `src\domain\usecases\user\signin\signin-user.usecase.ts`
- `src\domain\usecases\user\update-profile\update-user-profile.usecase.ts`
- `src\domain\validators\article\article.validator.factory.ts`
- `src\domain\validators\article\article.zod.validator.ts`
- `src\domain\validators\comment\comment.zod.validator.ts`
- `src\domain\validators\github-account\github-account.zod.validator.ts`
- `src\domain\validators\notification\notification.zod.validator.ts`
- `src\domain\validators\projects\projects.zod.validator.ts`
- `src\domain\validators\user\user-password.zod.validator.ts`
- `src\domain\validators\user\user.zod.validator.ts`
- `src\infra\repositories\database.module.ts`
- `src\infra\repositories\prisma\article\article.prisma.repository.provider.ts`
- `src\infra\repositories\prisma\article\article.prisma.repository.ts`
- `src\infra\repositories\prisma\article\model\mappers\article-entity-to-prisma-model.mapper.ts`
- `src\infra\repositories\prisma\article\model\mappers\article-prisma-model-to-entity.mapper.ts`
- `src\infra\repositories\prisma\client.prisma.ts`
- `src\infra\repositories\prisma\comment\comment.prisma.repository.provider.ts`
- `src\infra\repositories\prisma\comment\comment.prisma.repository.ts`
- `src\infra\repositories\prisma\comment\model\mappers\comment-entity-to-prisma-model.mapper.ts`
- `src\infra\repositories\prisma\comment\model\mappers\comment-prisma-model-to-entity.mapper.ts`
- `src\infra\repositories\prisma\github-account\github-account.prisma.repository.provider.ts`
- `src\infra\repositories\prisma\github-account\github-account.prisma.repository.ts`
- `src\infra\repositories\prisma\github-account\model\github-account.prisma.model.ts`
- `src\infra\repositories\prisma\github-account\model\mappers\github-account-entity-to-prisma-model.mapper.ts`
- `src\infra\repositories\prisma\github-account\model\mappers\github-account-prisma-model-to-entity.mapper.ts`
- `src\infra\repositories\prisma\google-account\google-account.prisma.repository.provider.ts`
- `src\infra\repositories\prisma\google-account\google-account.prisma.repository.ts`
- `src\infra\repositories\prisma\notification\model\mappers\notification-entity-to-prisma-model.mapper.ts`
- `src\infra\repositories\prisma\notification\model\mappers\notification-prisma-model-to-entity.mapper.ts`
- `src\infra\repositories\prisma\notification\notification.prisma.repository.provider.ts`
- `src\infra\repositories\prisma\notification\notification.prisma.repository.ts`
- `src\infra\repositories\prisma\projects\model\projects-entity-to-projects-prisma-model.mapper.ts`
- `src\infra\repositories\prisma\projects\model\projects-prisma-model-to-projects-entity.mapper.ts`
- `src\infra\repositories\prisma\projects\model\projects-relation-helper.mapper.ts`
- `src\infra\repositories\prisma\projects\model\projects-to-admin.mapper.ts`
- `src\infra\repositories\prisma\projects\model\projects-to-response.mapper.ts`
- `src\infra\repositories\prisma\projects\projects.prisma.repository.provider.ts`
- `src\infra\repositories\prisma\projects\projects.prisma.repository.ts`
- `src\infra\repositories\prisma\user\model\mappers\user-entity-to-user-prisma-model.mapper.ts`
- `src\infra\repositories\prisma\user\model\mappers\user-prisma-model-to-user-entity.mapper.ts`
- `src\infra\repositories\prisma\user\model\user.prisma.model.ts`
- `src\infra\repositories\prisma\user\user.prisma.repository.provider.ts`
- `src\infra\repositories\prisma\user\user.prisma.repository.ts`
- `src\infra\services\exceptions\jsonwebtoken\auth-token-not-valid.service.exception.ts`
- `src\infra\services\exceptions\jsonwebtoken\refresh-token-not-valid.service.exception.ts`
- `src\infra\services\exceptions\service.exception.ts`
- `src\infra\services\github\github-api\github-api.service.provider.ts`
- `src\infra\services\github\github-api\github-api.service.ts`
- `src\infra\services\github\github.service.provider.ts`
- `src\infra\services\github\github.service.ts`
- `src\infra\services\github\types.ts`
- `src\infra\services\google\google-api\google-api.service.provider.ts`
- `src\infra\services\google\google-api\google-api.service.ts`
- `src\infra\services\image-upload\image-upload.service.ts`
- `src\infra\services\jwt\jsonwebtoken\jsonwebtoken.jwt.service.provider.ts`
- `src\infra\services\jwt\jsonwebtoken\jsonwebtoken.jwt.service.ts`
- `src\infra\services\jwt\jwt.service.ts`
- `src\infra\services\notification\notification-stream.service.ts`
- `src\infra\services\service.module.ts`
- `src\infra\services\storage\railway\railway-storage.service.provider.ts`
- `src\infra\services\storage\railway\railway-storage.service.ts`
- `src\infra\services\storage\storage.service.ts`
- `src\infra\web\auth\auth.guards.ts`
- `src\infra\web\auth\decorators\is-public.decorator.ts`
- `src\infra\web\auth\decorators\roles.decorator.ts`
- `src\infra\web\filters\domain\domain-exception.filter.ts`
- `src\infra\web\filters\domain\validator-domain-exception.filter.ts`
- `src\infra\web\filters\infra\services\refresh-token-not-valid-service-exception.filter.ts`
- `src\infra\web\filters\infra\services\service-exception.filter.ts`
- `src\infra\web\filters\multer-exception.filter.ts`
- `src\infra\web\filters\usecases\article\article-access-denied-usecase-exception.filter.ts`
- `src\infra\web\filters\usecases\article\article-limit-reached-usecase-exception.filter.ts`
- `src\infra\web\filters\usecases\article\article-not-found-usecase-exception.filter.ts`
- `src\infra\web\filters\usecases\comment\comment-access-denied-usecase-exception.filter.ts`
- `src\infra\web\filters\usecases\comment\comment-limit-reached-usecase-exception.filter.ts`
- `src\infra\web\filters\usecases\comment\comment-moderation-required-usecase-exception.filter.ts`
- `src\infra\web\filters\usecases\comment\comment-not-found-usecase-exception.filter.ts`
- `src\infra\web\filters\usecases\credentials-not-valid-usecase-exception.filter.ts`
- `src\infra\web\filters\usecases\email-already-exists-usecase-exception.filter.ts`
- `src\infra\web\filters\usecases\projects\project-access-denied-usecase-exception.filter.ts`
- `src\infra\web\filters\usecases\projects\project-limit-reached-usecase-exception.filter.ts`
- `src\infra\web\filters\usecases\projects\project-not-found-usecase-exception.filter.ts`
- `src\infra\web\filters\usecases\usecase-exception.filter.ts`
- `src\infra\web\filters\usecases\user-not-found-usecase-exception.filter.ts`
- `src\infra\web\middleware\article-rate-limit.middleware.ts`
- `src\infra\web\routes\article\create\create-article.dto.ts`
- `src\infra\web\routes\article\create\create-article.presenter.ts`
- `src\infra\web\routes\article\create\create-article.route.ts`
- `src\infra\web\routes\article\find-by-id\find-article-by-id.dto.ts`
- `src\infra\web\routes\article\find-by-id\find-article-by-id.presenter.ts`
- `src\infra\web\routes\article\find-by-id\find-article-by-id.route.ts`
- `src\infra\web\routes\article\find-by-slug\find-article-by-slug.route.ts`
- `src\infra\web\routes\article\list\list-articles.dto.ts`
- `src\infra\web\routes\article\list\list-articles.presenter.ts`
- `src\infra\web\routes\article\list\list-articles.route.ts`
- `src\infra\web\routes\article\moderate\approve-article.route.ts`
- `src\infra\web\routes\article\moderate\moderate-article.dto.ts`
- `src\infra\web\routes\article\moderate\moderate-article.presenter.ts`
- `src\infra\web\routes\article\moderate\moderate-article.route.ts`
- `src\infra\web\routes\article\moderate\pending-articles.route.ts`
- `src\infra\web\routes\article\moderate\reject-article.route.ts`
- `src\infra\web\routes\article\my-articles\my-articles.dto.ts`
- `src\infra\web\routes\article\my-articles\my-articles.presenter.ts`
- `src\infra\web\routes\article\my-articles\my-articles.route.ts`
- `src\infra\web\routes\article\pending-moderation\pending-moderation.presenter.ts`
- `src\infra\web\routes\article\pending-moderation\pending-moderation.route.ts`
- `src\infra\web\routes\article\search\search-articles.route.ts`
- `src\infra\web\routes\article\stats\article-stats.route.ts`
- `src\infra\web\routes\article\tags\popular-tags.route.ts`
- `src\infra\web\routes\auth\github-auth\github-auth.route.ts`
- `src\infra\web\routes\comment\count\count-comments.dto.ts`
- `src\infra\web\routes\comment\count\count-comments.presenter.ts`
- `src\infra\web\routes\comment\count\count-comments.route.ts`
- `src\infra\web\routes\comment\create\create-comment.dto.ts`
- `src\infra\web\routes\comment\create\create-comment.presenter.ts`
- `src\infra\web\routes\comment\create\create-comment.route.ts`
- `src\infra\web\routes\comment\delete\delete-comment.dto.ts`
- `src\infra\web\routes\comment\delete\delete-comment.presenter.ts`
- `src\infra\web\routes\comment\delete\delete-comment.route.ts`
- `src\infra\web\routes\comment\find-replies\find-replies.dto.ts`
- `src\infra\web\routes\comment\find-replies\find-replies.presenter.ts`
- `src\infra\web\routes\comment\find-replies\find-replies.route.ts`
- `src\infra\web\routes\comment\list\list-comments.dto.ts`
- `src\infra\web\routes\comment\list\list-comments.presenter.ts`
- `src\infra\web\routes\comment\list\list-comments.route.ts`
- `src\infra\web\routes\comment\moderate\approve-comment.dto.ts`
- `src\infra\web\routes\comment\moderate\approve-comment.presenter.ts`
- `src\infra\web\routes\comment\moderate\approve-comment.route.ts`
- `src\infra\web\routes\comment\moderate\find-pending-moderation.dto.ts`
- `src\infra\web\routes\comment\moderate\find-pending-moderation.presenter.ts`
- `src\infra\web\routes\comment\moderate\pending-moderation.route.ts`
- `src\infra\web\routes\comment\moderate\reject-comment.dto.ts`
- `src\infra\web\routes\comment\moderate\reject-comment.presenter.ts`
- `src\infra\web\routes\comment\moderate\reject-comment.route.ts`
- `src\infra\web\routes\comment\stats\comment-stats.dto.ts`
- `src\infra\web\routes\comment\stats\comment-stats.presenter.ts`
- `src\infra\web\routes\comment\stats\comment-stats.route.ts`
- `src\infra\web\routes\comment\update\update-comment.dto.ts`
- `src\infra\web\routes\comment\update\update-comment.presenter.ts`
- `src\infra\web\routes\comment\update\update-comment.route.ts`
- `src\infra\web\routes\github-auth\callback\github-callback.dto.ts`
- `src\infra\web\routes\github-auth\callback\github-callback.presenter.ts`
- `src\infra\web\routes\github-auth\callback\github-callback.route.ts`
- `src\infra\web\routes\github-auth\link\link-github-account.dto.ts`
- `src\infra\web\routes\github-auth\link\link-github-account.presenter.ts`
- `src\infra\web\routes\github-auth\link\link-github-account.route.ts`
- `src\infra\web\routes\github-auth\start\start-github-auth.dto.ts`
- `src\infra\web\routes\github-auth\start\start-github-auth.presenter.ts`
- `src\infra\web\routes\github-auth\start\start-github-auth.route.ts`
- `src\infra\web\routes\github-auth\unlink\unlink-github-account.dto.ts`
- `src\infra\web\routes\github-auth\unlink\unlink-github-account.presenter.ts`
- `src\infra\web\routes\github-auth\unlink\unlink-github-account.route.ts`
- `src\infra\web\routes\google-auth\callback\google-callback.dto.ts`
- `src\infra\web\routes\google-auth\callback\google-callback.presenter.ts`
- `src\infra\web\routes\google-auth\callback\google-callback.route.ts`
- `src\infra\web\routes\google-auth\start\start-google-auth.dto.ts`
- `src\infra\web\routes\google-auth\start\start-google-auth.presenter.ts`
- `src\infra\web\routes\google-auth\start\start-google-auth.route.ts`
- `src\infra\web\routes\notification\find-by-user\find-notifications-by-user.dto.ts`
- `src\infra\web\routes\notification\find-by-user\find-notifications-by-user.presenter.ts`
- `src\infra\web\routes\notification\find-by-user\find-notifications-by-user.route.ts`
- `src\infra\web\routes\notification\get-unread-count\get-unread-count.route.ts`
- `src\infra\web\routes\notification\mark-all-read\mark-all-read.route.ts`
- `src\infra\web\routes\notification\mark-as-read\mark-notification-as-read.route.ts`
- `src\infra\web\routes\notification\stream\notification-stream.route.ts`
- `src\infra\web\routes\notification\websocket-status\websocket-status.route.ts`
- `src\infra\web\routes\projects\approve\approve-project.dto.ts`
- `src\infra\web\routes\projects\approve\approve-project.presenter.ts`
- `src\infra\web\routes\projects\approve\approve-project.route.ts`
- `src\infra\web\routes\projects\create\create-project-multipart.dto.ts`
- `src\infra\web\routes\projects\create\create-project-multipart.presenter.ts`
- `src\infra\web\routes\projects\create\create-project-multipart.route.ts`
- `src\infra\web\routes\projects\create\create-project.dto.ts`
- `src\infra\web\routes\projects\create\create-project.presenter.ts`
- `src\infra\web\routes\projects\create\create-project.route.ts`
- `src\infra\web\routes\projects\delete\delete-project.dto.ts`
- `src\infra\web\routes\projects\delete\delete-project.presenter.ts`
- `src\infra\web\routes\projects\delete\delete-project.route.ts`
- `src\infra\web\routes\projects\find-by-id\find-project-by-id.dto.ts`
- `src\infra\web\routes\projects\find-by-id\find-project-by-id.presenter.ts`
- `src\infra\web\routes\projects\find-by-id\find-project-by-id.route.ts`
- `src\infra\web\routes\projects\list-deleted\list-deleted-projects.route.ts`
- `src\infra\web\routes\projects\list\list-projects.dto.ts`
- `src\infra\web\routes\projects\list\list-projects.presenter.ts`
- `src\infra\web\routes\projects\list\list-projects.route.ts`
- `src\infra\web\routes\projects\my-projects\my-projects.dto.ts`
- `src\infra\web\routes\projects\my-projects\my-projects.presenter.ts`
- `src\infra\web\routes\projects\my-projects\my-projects.route.ts`
- `src\infra\web\routes\projects\update\update-project.dto.ts`
- `src\infra\web\routes\projects\update\update-project.presenter.ts`
- `src\infra\web\routes\projects\update\update-project.route.ts`
- `src\infra\web\routes\user\admin-update\admin-update-user.dto.ts`
- `src\infra\web\routes\user\admin-update\admin-update-user.presenter.ts`
- `src\infra\web\routes\user\admin-update\admin-update-user.route.ts`
- `src\infra\web\routes\user\create\create-user.dto.ts`
- `src\infra\web\routes\user\create\create-user.presenter.ts`
- `src\infra\web\routes\user\create\create-user.route.ts`
- `src\infra\web\routes\user\find-by-id\find-by-id-user.dto.ts`
- `src\infra\web\routes\user\find-by-id\find-by-id-user.presenter.ts`
- `src\infra\web\routes\user\find-by-id\find-by-id-user.route.ts`
- `src\infra\web\routes\user\list-users\list-users.dto.ts`
- `src\infra\web\routes\user\list-users\list-users.presenter.ts`
- `src\infra\web\routes\user\list-users\list-users.route.ts`
- `src\infra\web\routes\user\login\login-user.dto.ts`
- `src\infra\web\routes\user\login\login-user.presenter.ts`
- `src\infra\web\routes\user\login\login-user.route.ts`
- `src\infra\web\routes\user\me\me-user.dto.ts`
- `src\infra\web\routes\user\me\me-user.presenter.ts`
- `src\infra\web\routes\user\me\me-user.route.ts`
- `src\infra\web\routes\user\moderator-update\moderator-update-user.dto.ts`
- `src\infra\web\routes\user\moderator-update\moderator-update-user.presenter.ts`
- `src\infra\web\routes\user\moderator-update\moderator-update-user.route.ts`
- `src\infra\web\routes\user\providers\user-providers.route.ts`
- `src\infra\web\routes\user\refresh-auth-token\refresh-auth-token.dto.ts`
- `src\infra\web\routes\user\refresh-auth-token\refresh-auth-token.presenter.ts`
- `src\infra\web\routes\user\refresh-auth-token\refresh-auth-token.route.ts`
- `src\infra\web\routes\user\update-profile\update-user-profile.dto.ts`
- `src\infra\web\routes\user\update-profile\update-user-profile.presenter.ts`
- `src\infra\web\routes\user\update-profile\update-user-profile.route.ts`
- `src\infra\web\web.module.ts`
- `src\infra\websocket\notification.gateway.ts`
- `src\infra\websocket\websocket.module.ts`
- `src\main.ts`
- `src\shared\exceptions\exception.ts`
- `src\shared\utils\exception-utils.ts`
- `src\shared\utils\log-utils.ts`
- `src\shared\utils\utils.ts`
- `src\shared\utils\zod-utils.ts`
- `src\usecases\article\approve\approve-article.usecase.ts`
- `src\usecases\article\create\create-article.usecase.ts`
- `src\usecases\article\find-by-id\find-article-by-id.usecase.ts`
- `src\usecases\article\find-by-slug\find-article-by-slug.usecase.ts`
- `src\usecases\article\get-pending-moderation\get-pending-moderation.usecase.ts`
- `src\usecases\article\list\list-articles.usecase.ts`
- `src\usecases\article\moderate\moderate-article.usecase.ts`
- `src\usecases\article\my-articles\my-articles.usecase.ts`
- `src\usecases\article\popular-tags\popular-tags.usecase.ts`
- `src\usecases\article\reject\reject-article.usecase.ts`
- `src\usecases\article\search\search-articles.usecase.ts`
- `src\usecases\article\stats\article-stats.usecase.ts`
- `src\usecases\comment\count\count-comments.usecase.ts`
- `src\usecases\comment\create\create-comment.usecase.ts`
- `src\usecases\comment\delete\delete-comment.usecase.ts`
- `src\usecases\comment\find-replies\find-replies.usecase.ts`
- `src\usecases\comment\list\list-comments.usecase.ts`
- `src\usecases\comment\moderate\approve-comment.usecase.ts`
- `src\usecases\comment\moderate\find-pending-moderation.usecase.ts`
- `src\usecases\comment\moderate\reject-comment.usecase.ts`
- `src\usecases\comment\stats\comment-stats.usecase.ts`
- `src\usecases\comment\update\update-comment.usecase.ts`
- `src\usecases\exceptions\article\article-not-found.usecase.exception.ts`
- `src\usecases\exceptions\comment\comment-access-denied.usecase.exception.ts`
- `src\usecases\exceptions\comment\comment-limit-reached.usecase.exception.ts`
- `src\usecases\exceptions\comment\comment-moderation-required.usecase.exception.ts`
- `src\usecases\exceptions\comment\comment-not-found.usecase.exception.ts`
- `src\usecases\exceptions\credentials-not-valid.usecase.exception.ts`
- `src\usecases\exceptions\email-already-exists.usecase.exception.ts`
- `src\usecases\exceptions\input\invalid-input.usecase.exception.ts`
- `src\usecases\exceptions\projects\project-access-denied.usecase.exception.ts`
- `src\usecases\exceptions\projects\project-limit-reached.usecase.exception.ts`
- `src\usecases\exceptions\projects\project-not-found.usecase.exception.ts`
- `src\usecases\exceptions\projects\projects-aumont-limit-reached.usecase.exceptions.ts`
- `src\usecases\exceptions\usecase.exception.ts`
- `src\usecases\exceptions\user\user-not-found.usecase.exception.ts`
- `src\usecases\moderation\find-pending-articles\find-pending-articles.usecase.ts`
- `src\usecases\notification\find-by-user\find-notifications-by-user.usecase.ts`
- `src\usecases\notification\get-unread-count\get-unread-notifications-count.usecase.ts`
- `src\usecases\notification\mark-all-read\mark-all-notifications-as-read.usecase.ts`
- `src\usecases\notification\mark-as-read\mark-notification-as-read.usecase.ts`
- `src\usecases\projects\approve\approve-project.usecase.ts`
- `src\usecases\projects\create\create-project.usecase.ts`
- `src\usecases\projects\delete\delete-project.usecase.ts`
- `src\usecases\projects\find-by-id\find-project-by-id.usecase.ts`
- `src\usecases\projects\list-deleted\list-deleted-projects.usecase.ts`
- `src\usecases\projects\list\list-projects.usecase.ts`
- `src\usecases\projects\my-projects\my-projects.usecase.ts`
- `src\usecases\projects\restore\restore-project.usecase.ts`
- `src\usecases\projects\update\update-project.usecase.ts`
- `src\usecases\usecase.module.ts`
- `src\usecases\usecase.ts`
- `src\usecases\user\admin-update\admin-update-user.usecase.ts`
- `src\usecases\user\create\create-user.usecase.ts`
- `src\usecases\user\find-by-id\find-user.usecase.ts`
- `src\usecases\user\list-users\list-users.usecase.ts`
- `src\usecases\user\login\login-user.usecase.ts`
- `src\usecases\user\me\me-user.usecase.ts`
- `src\usecases\user\moderator-update\moderator-update-user.usecase.ts`
- `src\usecases\user\refresh-auth-token\refresh-auth-token-user.usecase.ts`
- `src\usecases\user\update-profile\update-user-profile.usecase.ts`
- `test\app.e2e-spec.ts`

### JavaScript

- `.env`
- `generated\prisma\client.js`
- `generated\prisma\default.js`
- `generated\prisma\edge.js`
- `generated\prisma\index-browser.js`
- `generated\prisma\index.js`
- `generated\prisma\runtime\edge-esm.js`
- `generated\prisma\runtime\edge.js`
- `generated\prisma\runtime\index-browser.js`
- `generated\prisma\runtime\library.js`
- `generated\prisma\runtime\react-native.js`
- `generated\prisma\runtime\wasm-compiler-edge.js`
- `generated\prisma\runtime\wasm-engine-edge.js`
- `generated\prisma\wasm.js`

### Configuração

- `.env`
- `docker-compose.yml`
- `generated\prisma\package.json`
- `nest-cli.json`
- `package-lock.json`
- `package.json`
- `test\jest-e2e.json`
- `tsconfig.build.json`
- `tsconfig.json`

### Documentação

- `.env`
- `README.md`
- `estrutura_detalhada.md`
- `estrutura_projeto.md`
- `src\domain\usecases\article\business_rules.md`
- `src\domain\usecases\article\comandos.md`
- `src\domain\usecases\article\docs.md`
- `src\domain\usecases\article\usePostman.md`
- `src\domain\usecases\comment\docs_v1.md`

### Docker

- `.env`

### Outros

- `.env`


# Estrutura Detalhada: darkstack

**Gerado em:** 03/08/2025 22:14:37

## 📁 .

- **.env** (2.6KB)
- **.gitignore** (1.0KB)
- **.prettierrc** (54B)
- **README.md** (5.0KB)
- **comandos.me** (64B)
- **deploy.ps1** (2.5KB)
- **docker-compose.yml** (1.7KB)
- **eslint.config.mjs** (869B)
- **estrutura_detalhada.md** (0B)
- **estrutura_projeto.md** (43.4KB)
- **leitor_nestjs.py** (6.5KB)
- **nest-cli.json** (201B)
- **nginx.conf** (879B)
- **package-lock.json** (449.0KB)
- **package.json** (2.9KB)
- **railway.toml** (203B)
- **tsconfig.build.json** (99B)
- **tsconfig.json** (769B)

## 📁 docker

- **Dockerfile** (530B)

## 📁 generated\prisma

- **client.d.ts** (23B)
- **client.js** (125B)
- **default.d.ts** (23B)
- **default.js** (125B)
- **edge.d.ts** (25B)
- **edge.js** (63.6KB)
- **index-browser.js** (11.0KB)
- **index.d.ts** (814.4KB)
- **index.js** (64.5KB)
- **libquery_engine-linux-musl-openssl-3.0.x.so.node** (16.7MB)
- **package.json** (4.1KB)
- **query_engine-windows.dll.node** (20.1MB)
- **query_engine-windows.dll.node.tmp14016** (20.1MB)
- **query_engine-windows.dll.node.tmp17876** (20.1MB)
- **query_engine-windows.dll.node.tmp25720** (20.1MB)
- **query_engine-windows.dll.node.tmp28352** (20.1MB)
- **query_engine-windows.dll.node.tmp3424** (20.1MB)
- **query_engine-windows.dll.node.tmp34260** (20.1MB)
- **query_engine-windows.dll.node.tmp36512** (20.1MB)
- **query_engine-windows.dll.node.tmp36832** (20.1MB)
- **schema.prisma** (11.0KB)
- **wasm.d.ts** (23B)
- **wasm.js** (11.0KB)

## 📁 generated\prisma\runtime

- **edge-esm.js** (164.4KB)
- **edge.js** (164.9KB)
- **index-browser.d.ts** (11.6KB)
- **index-browser.js** (34.6KB)
- **library.d.ts** (120.9KB)
- **library.js** (196.6KB)
- **react-native.js** (177.1KB)
- **wasm-compiler-edge.js** (185.8KB)
- **wasm-engine-edge.js** (127.7KB)

## 📁 prisma

- **schema.prisma** (11.5KB)

## 📁 public\uploads\projects

- **0205abc2-c25d-42e3-bd3e-6e24d47efa7b.jpeg** (35.3KB)
- **480072a4-d611-4aff-9ffa-f2eccdbaa06d.jpeg** (35.3KB)
- **57920c4b-aff2-4789-9aa6-7e0238ee9642.jpeg** (35.3KB)
- **cdb5b96d-0308-466e-b530-cbb7b28d9d1f.jpeg** (35.3KB)
- **e28f8c2f-84dd-4a4c-aea0-1eb2490b7394.jpeg** (35.3KB)

## 📁 src

- **app.controller.spec.ts** (639B)
- **app.controller.ts** (286B)
- **app.module.ts** (323B)
- **app.service.ts** (150B)
- **main.ts** (1.2KB)

## 📁 src\domain\entities\article

- **article.entity.ts** (11.5KB)

## 📁 src\domain\entities\github-account

- **github-account.entity.ts** (5.0KB)

## 📁 src\domain\entities\google-account

- **google-account.entity.ts** (4.4KB)

## 📁 src\domain\entities\notification

- **notification.entity.ts** (9.3KB)

## 📁 src\domain\entities\projects

- **projects.entity.ts** (4.5KB)

## 📁 src\domain\entities\user

- **user.entitty.ts** (5.9KB)

## 📁 src\domain\factories\github-account

- **github-account.validator.factory.ts** (502B)

## 📁 src\domain\factories\notification

- **notification.validator.factory.ts** (481B)

## 📁 src\domain\factories\projects

- **projects.validator.factory.ts** (368B)

## 📁 src\domain\factories\user

- **user-password.validator.factory.ts** (305B)
- **user.validator.factory.ts** (327B)

## 📁 src\domain\repositories\article

- **article.gateway.repository.ts** (4.1KB)

## 📁 src\domain\repositories\github-account

- **github-account.gateway.repository.ts** (636B)

## 📁 src\domain\repositories\google-account

- **google-account.gateway.repository.ts** (557B)

## 📁 src\domain\repositories\notification

- **notification.gateway.repository.ts** (2.8KB)

## 📁 src\domain\repositories\projects

- **projects.gateway.repository.ts** (7.4KB)

## 📁 src\domain\repositories\user

- **user.gateway.repository.ts** (1.2KB)

## 📁 src\domain\shared\entities

- **entity.ts** (745B)

## 📁 src\domain\shared\exceptions

- **domain.exception.ts** (315B)
- **validator-domain.exception.ts** (329B)

## 📁 src\domain\shared\validators

- **validator.ts** (72B)

## 📁 src\domain\usecases

- **usecase.module.ts** (847B)
- **usecase.ts** (93B)

## 📁 src\domain\usecases\article

- **business_rules.md** (4.8KB)
- **clean_arch.MD** (9.8KB)
- **comandos.md** (1.5KB)
- **docs.md** (1.8KB)
- **new_usecase.MD** (6.6KB)
- **postman.MD** (16.6KB)
- **usePostman.md** (3.6KB)

## 📁 src\domain\usecases\article\approve

- **approve-article.usecase.ts** (4.6KB)

## 📁 src\domain\usecases\article\create

- **create-article.usecase.ts** (6.1KB)

## 📁 src\domain\usecases\article\find-by-id

- **find-article-by-id.usecase.ts** (5.4KB)

## 📁 src\domain\usecases\article\find-by-slug

- **find-article-by-slug.usecase.ts** (4.9KB)

## 📁 src\domain\usecases\article\get-pending-moderation

- **get-pending-moderation.usecase.ts** (4.5KB)

## 📁 src\domain\usecases\article\list

- **list-articles.usecase.ts** (4.3KB)

## 📁 src\domain\usecases\article\popular-tags

- **popular-tags.usecase.ts** (1.9KB)

## 📁 src\domain\usecases\article\reject

- **reject-article.usecase.ts** (5.0KB)

## 📁 src\domain\usecases\article\search

- **search-articles.usecase.ts** (2.9KB)

## 📁 src\domain\usecases\article\stats

- **article-stats.usecase.ts** (4.7KB)

## 📁 src\domain\usecases\exceptions

- **usecase.exception.ts** (463B)

## 📁 src\domain\usecases\exceptions\article

- **article-not-found.usecase.exception.ts** (442B)

## 📁 src\domain\usecases\exceptions\auth

- **unauthorized.usecase.exception.ts** (354B)

## 📁 src\domain\usecases\exceptions\email

- **email-already-exists.usecase.exception.ts** (362B)

## 📁 src\domain\usecases\exceptions\input

- **invalid-input.usecase.exception.ts** (520B)

## 📁 src\domain\usecases\exceptions\notification

- **notification-not-found.usecase.exception.ts** (464B)

## 📁 src\domain\usecases\exceptions\user

- **credentials-not-valid.usecase.exception.ts** (371B)
- **user-not-found.usecase.exception.ts** (350B)

## 📁 src\domain\usecases\github-auth\github-callback

- **github-callback.usecase.ts** (6.9KB)

## 📁 src\domain\usecases\github-auth\link-github-account

- **link-github-account.usecase.ts** (3.3KB)

## 📁 src\domain\usecases\github-auth\start-github-auth

- **start-github-auth.usecase.ts** (789B)

## 📁 src\domain\usecases\github-auth\unlink-github-account

- **unlink-github-account.usecase.ts** (2.6KB)

## 📁 src\domain\usecases\google-auth\google-callback

- **google-callback.usecase.ts** (5.1KB)

## 📁 src\domain\usecases\google-auth\start-google-auth

- **start-google-auth.usecase.ts** (1.6KB)

## 📁 src\domain\usecases\notification

- **docs_v1.MD** (2.9KB)
- **docs_v2.MD** (14.8KB)

## 📁 src\domain\usecases\notification\create

- **create-notification.usecase.ts** (4.1KB)

## 📁 src\domain\usecases\notification\create-many

- **create-many-notifications.usecase.ts** (2.1KB)

## 📁 src\domain\usecases\notification\find-by-user

- **find-notifications-by-user.usecase.ts** (2.7KB)

## 📁 src\domain\usecases\notification\mark-as-read

- **mark-notification-as-read.usecase.ts** (3.0KB)

## 📁 src\domain\usecases\notification\notify-moderators

- **notify-moderators.usecase.ts** (5.4KB)

## 📁 src\domain\usecases\projects\approve

- **approve-project.usecase.ts** (11.7KB)

## 📁 src\domain\usecases\projects\create

- **create-projects.usecase.ts** (10.9KB)

## 📁 src\domain\usecases\projects\delete

- **delete-project.usecase.ts** (7.1KB)

## 📁 src\domain\usecases\projects\find-by-id

- **find-project-by-id.usecase.ts** (8.0KB)

## 📁 src\domain\usecases\projects\list

- **list-projects.usecase.ts** (4.2KB)

## 📁 src\domain\usecases\projects\list-deleted

- **list-deleted-projects.usecase.ts** (4.5KB)

## 📁 src\domain\usecases\projects\my-projects

- **my-projects.usecase.ts** (5.1KB)

## 📁 src\domain\usecases\projects\restore

- **restore-project.usecase.ts** (3.8KB)

## 📁 src\domain\usecases\projects\update

- **update-project.usecase.ts** (10.2KB)

## 📁 src\domain\usecases\providers

- **user-providers.usecase.ts** (4.0KB)

## 📁 src\domain\usecases\user\admin-update

- **admin-update-user.usecase.ts** (9.0KB)

## 📁 src\domain\usecases\user\create

- **create-user.usecase.ts** (1.4KB)

## 📁 src\domain\usecases\user\find-by-id

- **find-user.usecase.ts** (1.2KB)

## 📁 src\domain\usecases\user\list-users

- **list-users.usecase.ts** (7.0KB)

## 📁 src\domain\usecases\user\moderator-update

- **moderator-update-user.usecase.ts** (9.1KB)

## 📁 src\domain\usecases\user\refresh-auth-token

- **refresh-auth-token-user.usecase.ts** (1.5KB)

## 📁 src\domain\usecases\user\signin

- **signin-user.usecase.ts** (1.9KB)

## 📁 src\domain\usecases\user\update-profile

- **update-user-profile.usecase.ts** (6.7KB)

## 📁 src\domain\validators\article

- **article.validator.factory.ts** (426B)
- **article.zod.validator.ts** (7.9KB)

## 📁 src\domain\validators\github-account

- **github-account.zod.validator.ts** (2.5KB)

## 📁 src\domain\validators\notification

- **notification.zod.validator.ts** (3.5KB)

## 📁 src\domain\validators\projects

- **projects.zod.validator.ts** (6.2KB)

## 📁 src\domain\validators\user

- **user-password.zod.validator.ts** (1.5KB)
- **user.zod.validator.ts** (2.0KB)

## 📁 src\infra\repositories

- **database.module.ts** (1.4KB)

## 📁 src\infra\repositories\prisma

- **client.prisma.ts** (99B)

## 📁 src\infra\repositories\prisma\article

- **article.prisma.repository.provider.ts** (384B)
- **article.prisma.repository.ts** (19.1KB)

## 📁 src\infra\repositories\prisma\article\model\mappers

- **article-entity-to-prisma-model.mapper.ts** (1.4KB)
- **article-prisma-model-to-entity.mapper.ts** (2.0KB)

## 📁 src\infra\repositories\prisma\github-account

- **github-account.prisma.repository.provider.ts** (451B)
- **github-account.prisma.repository.ts** (4.8KB)

## 📁 src\infra\repositories\prisma\github-account\model

- **github-account.prisma.model.ts** (207B)

## 📁 src\infra\repositories\prisma\github-account\model\mappers

- **github-account-entity-to-prisma-model.mapper.ts** (1.1KB)
- **github-account-prisma-model-to-entity.mapper.ts** (1.1KB)

## 📁 src\infra\repositories\prisma\google-account

- **google-account.prisma.repository.provider.ts** (451B)
- **google-account.prisma.repository.ts** (3.7KB)

## 📁 src\infra\repositories\prisma\notification

- **notification.prisma.repository.provider.ts** (434B)
- **notification.prisma.repository.ts** (9.8KB)

## 📁 src\infra\repositories\prisma\notification\model\mappers

- **notification-entity-to-prisma-model.mapper.ts** (936B)
- **notification-prisma-model-to-entity.mapper.ts** (787B)

## 📁 src\infra\repositories\prisma\projects

- **projects.prisma.repository.provider.ts** (396B)
- **projects.prisma.repository.ts** (12.1KB)

## 📁 src\infra\repositories\prisma\projects\model

- **projects-entity-to-projects-prisma-model.mapper.ts** (1.9KB)
- **projects-prisma-model-to-projects-entity.mapper.ts** (1.7KB)
- **projects-relation-helper.mapper.ts** (1.4KB)
- **projects-to-admin.mapper.ts** (1.5KB)
- **projects-to-response.mapper.ts** (1.4KB)

## 📁 src\infra\repositories\prisma\user

- **user.prisma.repository.provider.ts** (282B)
- **user.prisma.repository.ts** (6.8KB)

## 📁 src\infra\repositories\prisma\user\model

- **user.prisma.model.ts** (94B)

## 📁 src\infra\repositories\prisma\user\model\mappers

- **user-entity-to-user-prisma-model.mapper.ts** (689B)
- **user-prisma-model-to-user-entity.mapper.ts** (687B)

## 📁 src\infra\services

- **service.module.ts** (1.2KB)

## 📁 src\infra\services\exceptions

- **service.exception.ts** (328B)

## 📁 src\infra\services\exceptions\jsonwebtoken

- **auth-token-not-valid.service.exception.ts** (365B)
- **refresh-token-not-valid.service.exception.ts** (371B)

## 📁 src\infra\services\github

- **github.service.provider.ts** (0B)
- **github.service.ts** (625B)
- **types.ts** (449B)

## 📁 src\infra\services\github\github-api

- **github-api.service.provider.ts** (300B)
- **github-api.service.ts** (7.0KB)

## 📁 src\infra\services\google\google-api

- **google-api.service.provider.ts** (240B)
- **google-api.service.ts** (7.2KB)

## 📁 src\infra\services\image-upload

- **image-upload.service.ts** (3.6KB)

## 📁 src\infra\services\jwt

- **jwt.service.ts** (739B)

## 📁 src\infra\services\jwt\jsonwebtoken

- **jsonwebtoken.jwt.service.provider.ts** (226B)
- **jsonwebtoken.jwt.service.ts** (3.9KB)

## 📁 src\infra\services\notification

- **notification-stream.service.ts** (5.6KB)

## 📁 src\infra\services\storage

- **storage.service.ts** (523B)

## 📁 src\infra\services\storage\railway

- **railway-storage.service.provider.ts** (315B)
- **railway-storage.service.ts** (5.8KB)

## 📁 src\infra\web

- **web.module.ts** (8.0KB)

## 📁 src\infra\web\auth

- **auth.guards.ts** (2.7KB)

## 📁 src\infra\web\auth\decorators

- **is-public.decorator.ts** (149B)
- **roles.decorator.ts** (159B)

## 📁 src\infra\web\filters

- **multer-exception.filter.ts** (1.4KB)

## 📁 src\infra\web\filters\domain

- **domain-exception.filter.ts** (986B)
- **validator-domain-exception.filter.ts** (1.0KB)

## 📁 src\infra\web\filters\infra\services

- **refresh-token-not-valid-service-exception.filter.ts** (1.1KB)
- **service-exception.filter.ts** (994B)

## 📁 src\infra\web\filters\usecases

- **credentials-not-valid-usecase-exception.filter.ts** (1.1KB)
- **email-already-exists-usecase-exception.filter.ts** (1.1KB)
- **usecase-exception.filter.ts** (977B)
- **user-not-found-usecase-exception.filter.ts** (1.0KB)

## 📁 src\infra\web\filters\usecases\article

- **article-access-denied-usecase-exception.filter.ts** (1.4KB)
- **article-limit-reached-usecase-exception.filter.ts** (1.4KB)
- **article-not-found-usecase-exception.filter.ts** (1.1KB)

## 📁 src\infra\web\filters\usecases\projects

- **project-access-denied-usecase-exception.filter.ts** (1.2KB)
- **project-limit-reached-usecase-exception.filter.ts** (1.2KB)
- **project-not-found-usecase-exception.filter.ts** (1.2KB)

## 📁 src\infra\web\middleware

- **article-rate-limit.middleware.ts** (1.9KB)

## 📁 src\infra\web\routes\article\create

- **create-article.dto.ts** (617B)
- **create-article.presenter.ts** (679B)
- **create-article.route.ts** (1.3KB)

## 📁 src\infra\web\routes\article\find-by-id

- **find-article-by-id.dto.ts** (782B)
- **find-article-by-id.presenter.ts** (1.0KB)
- **find-article-by-id.route.ts** (1.4KB)

## 📁 src\infra\web\routes\article\find-by-slug

- **find-article-by-slug.route.ts** (1.4KB)

## 📁 src\infra\web\routes\article\list

- **list-articles.dto.ts** (1.1KB)
- **list-articles.presenter.ts** (427B)
- **list-articles.route.ts** (1.8KB)

## 📁 src\infra\web\routes\article\moderate

- **approve-article.route.ts** (1.3KB)
- **moderate-article.dto.ts** (524B)
- **moderate-article.presenter.ts** (707B)
- **moderate-article.route.ts** (1.5KB)
- **pending-articles.route.ts** (1.0KB)
- **reject-article.route.ts** (1.5KB)

## 📁 src\infra\web\routes\article\my-articles

- **my-articles.dto.ts** (943B)
- **my-articles.presenter.ts** (453B)
- **my-articles.route.ts** (1.1KB)

## 📁 src\infra\web\routes\article\pending-moderation

- **pending-moderation.presenter.ts** (997B)
- **pending-moderation.route.ts** (1.4KB)

## 📁 src\infra\web\routes\article\search

- **search-articles.route.ts** (1.9KB)

## 📁 src\infra\web\routes\article\stats

- **article-stats.route.ts** (1.7KB)

## 📁 src\infra\web\routes\article\tags

- **popular-tags.route.ts** (1.1KB)

## 📁 src\infra\web\routes\auth\github-auth

- **github-auth.route.ts** (2.2KB)

## 📁 src\infra\web\routes\github-auth\callback

- **github-callback.dto.ts** (395B)
- **github-callback.presenter.ts** (1000B)
- **github-callback.route.ts** (3.4KB)

## 📁 src\infra\web\routes\github-auth\link

- **link-github-account.dto.ts** (285B)
- **link-github-account.presenter.ts** (622B)
- **link-github-account.route.ts** (1.0KB)

## 📁 src\infra\web\routes\github-auth\start

- **start-github-auth.dto.ts** (205B)
- **start-github-auth.presenter.ts** (461B)
- **start-github-auth.route.ts** (939B)

## 📁 src\infra\web\routes\github-auth\unlink

- **unlink-github-account.dto.ts** (141B)
- **unlink-github-account.presenter.ts** (480B)
- **unlink-github-account.route.ts** (943B)

## 📁 src\infra\web\routes\google-auth\callback

- **google-callback.dto.ts** (381B)
- **google-callback.presenter.ts** (883B)
- **google-callback.route.ts** (3.3KB)

## 📁 src\infra\web\routes\google-auth\start

- **start-google-auth.dto.ts** (205B)
- **start-google-auth.presenter.ts** (463B)
- **start-google-auth.route.ts** (939B)

## 📁 src\infra\web\routes\notification\find-by-user

- **find-notifications-by-user.dto.ts** (638B)
- **find-notifications-by-user.presenter.ts** (1.1KB)
- **find-notifications-by-user.route.ts** (1.2KB)

## 📁 src\infra\web\routes\notification\get-unread-count

- **get-unread-count.route.ts** (752B)

## 📁 src\infra\web\routes\notification\mark-all-read

- **mark-all-read.route.ts** (812B)

## 📁 src\infra\web\routes\notification\mark-as-read

- **mark-notification-as-read.route.ts** (894B)

## 📁 src\infra\web\routes\notification\stream

- **notification-stream.route.ts** (991B)

## 📁 src\infra\web\routes\notification\websocket-status

- **websocket-status.route.ts** (1.1KB)

## 📁 src\infra\web\routes\projects\approve

- **approve-project.dto.ts** (638B)
- **approve-project.presenter.ts** (891B)
- **approve-project.route.ts** (1.8KB)

## 📁 src\infra\web\routes\projects\create

- **create-project-multipart.dto.ts** (486B)
- **create-project-multipart.presenter.ts** (639B)
- **create-project-multipart.route.ts** (5.3KB)
- **create-project.dto.ts** (612B)
- **create-project.presenter.ts** (586B)
- **create-project.route.ts** (2.8KB)

## 📁 src\infra\web\routes\projects\delete

- **delete-project.dto.ts** (288B)
- **delete-project.presenter.ts** (501B)
- **delete-project.route.ts** (3.0KB)

## 📁 src\infra\web\routes\projects\find-by-id

- **find-project-by-id.dto.ts** (770B)
- **find-project-by-id.presenter.ts** (1.6KB)
- **find-project-by-id.route.ts** (1.5KB)

## 📁 src\infra\web\routes\projects\list

- **list-projects.dto.ts** (841B)
- **list-projects.presenter.ts** (1.1KB)
- **list-projects.route.ts** (1.3KB)

## 📁 src\infra\web\routes\projects\list-deleted

- **list-deleted-projects.route.ts** (1.6KB)

## 📁 src\infra\web\routes\projects\my-projects

- **my-projects.dto.ts** (1.0KB)
- **my-projects.presenter.ts** (1.1KB)
- **my-projects.route.ts** (1.2KB)

## 📁 src\infra\web\routes\projects\update

- **update-project.dto.ts** (939B)
- **update-project.presenter.ts** (901B)
- **update-project.route.ts** (1.5KB)

## 📁 src\infra\web\routes\user\admin-update

- **admin-update-user.dto.ts** (734B)
- **admin-update-user.presenter.ts** (957B)
- **admin-update-user.route.ts** (1.8KB)

## 📁 src\infra\web\routes\user\create

- **create-user.dto.ts** (230B)
- **create-user.presenter.ts** (366B)
- **create-user.route.ts** (1.0KB)

## 📁 src\infra\web\routes\user\find-by-id

- **find-by-id-user.dto.ts** (185B)
- **find-by-id-user.presenter.ts** (485B)
- **find-by-id-user.route.ts** (856B)

## 📁 src\infra\web\routes\user\list-users

- **list-users.dto.ts** (1.0KB)
- **list-users.presenter.ts** (825B)
- **list-users.route.ts** (1.9KB)

## 📁 src\infra\web\routes\user\login

- **login-user.dto.ts** (163B)
- **login-user.presenter.ts** (401B)
- **login-user.route.ts** (913B)

## 📁 src\infra\web\routes\user\me

- **me-user.dto.ts** (280B)
- **me-user.presenter.ts** (534B)
- **me-user.route.ts** (941B)

## 📁 src\infra\web\routes\user\moderator-update

- **moderator-update-user.dto.ts** (561B)
- **moderator-update-user.presenter.ts** (971B)
- **moderator-update-user.route.ts** (2.0KB)

## 📁 src\infra\web\routes\user\providers

- **user-providers.route.ts** (878B)

## 📁 src\infra\web\routes\user\refresh-auth-token

- **refresh-auth-token.dto.ts** (138B)
- **refresh-auth-token.presenter.ts** (465B)
- **refresh-auth-token.route.ts** (1.0KB)

## 📁 src\infra\web\routes\user\update-profile

- **update-user-profile.dto.ts** (464B)
- **update-user-profile.presenter.ts** (726B)
- **update-user-profile.route.ts** (1.4KB)

## 📁 src\infra\websocket

- **notification.gateway.ts** (8.3KB)
- **websocket.module.ts** (600B)

## 📁 src\shared\exceptions

- **exception.ts** (922B)

## 📁 src\shared\utils

- **exception-utils.ts** (487B)
- **log-utils.ts** (327B)
- **utils.ts** (692B)
- **zod-utils.ts** (280B)

## 📁 src\usecases

- **usecase.module.ts** (10.2KB)
- **usecase.ts** (87B)

## 📁 src\usecases\article\approve

- **approve-article.usecase.ts** (1.2KB)

## 📁 src\usecases\article\create

- **create-article.usecase.ts** (2.4KB)

## 📁 src\usecases\article\find-by-id

- **find-article-by-id.usecase.ts** (2.0KB)

## 📁 src\usecases\article\find-by-slug

- **find-article-by-slug.usecase.ts** (2.0KB)

## 📁 src\usecases\article\get-pending-moderation

- **get-pending-moderation.usecase.ts** (4.5KB)

## 📁 src\usecases\article\list

- **list-articles.usecase.ts** (1.7KB)

## 📁 src\usecases\article\moderate

- **moderate-article.usecase.ts** (6.1KB)

## 📁 src\usecases\article\my-articles

- **my-articles.usecase.ts** (4.1KB)

## 📁 src\usecases\article\popular-tags

- **popular-tags.usecase.ts** (1.3KB)

## 📁 src\usecases\article\reject

- **reject-article.usecase.ts** (1.3KB)

## 📁 src\usecases\article\search

- **search-articles.usecase.ts** (1.3KB)

## 📁 src\usecases\article\stats

- **article-stats.usecase.ts** (2.4KB)

## 📁 src\usecases\exceptions

- **credentials-not-valid.usecase.exception.ts** (366B)
- **email-already-exists.usecase.exception.ts** (474B)
- **usecase.exception.ts** (468B)

## 📁 src\usecases\exceptions\article

- **article-not-found.usecase.exception.ts** (436B)

## 📁 src\usecases\exceptions\input

- **invalid-input.usecase.exception.ts** (553B)

## 📁 src\usecases\exceptions\projects

- **project-access-denied.usecase.exception.ts** (456B)
- **project-limit-reached.usecase.exception.ts** (456B)
- **project-not-found.usecase.exception.ts** (444B)
- **projects-aumont-limit-reached.usecase.exceptions.ts** (383B)

## 📁 src\usecases\exceptions\user

- **user-not-found.usecase.exception.ts** (355B)

## 📁 src\usecases\moderation\find-pending-articles

- **find-pending-articles.usecase.ts** (3.0KB)

## 📁 src\usecases\notification\find-by-user

- **find-notifications-by-user.usecase.ts** (1.2KB)

## 📁 src\usecases\notification\get-unread-count

- **get-unread-notifications-count.usecase.ts** (1.6KB)

## 📁 src\usecases\notification\mark-all-read

- **mark-all-notifications-as-read.usecase.ts** (1.7KB)

## 📁 src\usecases\notification\mark-as-read

- **mark-notification-as-read.usecase.ts** (1.0KB)

## 📁 src\usecases\projects\approve

- **approve-project.usecase.ts** (7.1KB)

## 📁 src\usecases\projects\create

- **create-project.usecase.ts** (2.5KB)

## 📁 src\usecases\projects\delete

- **delete-project.usecase.ts** (2.9KB)

## 📁 src\usecases\projects\find-by-id

- **find-project-by-id.usecase.ts** (3.3KB)

## 📁 src\usecases\projects\list

- **list-projects.usecase.ts** (2.0KB)

## 📁 src\usecases\projects\list-deleted

- **list-deleted-projects.usecase.ts** (2.7KB)

## 📁 src\usecases\projects\my-projects

- **my-projects.usecase.ts** (2.7KB)

## 📁 src\usecases\projects\restore

- **restore-project.usecase.ts** (2.9KB)

## 📁 src\usecases\projects\update

- **update-project.usecase.ts** (3.7KB)

## 📁 src\usecases\user\admin-update

- **admin-update-user.usecase.ts** (3.0KB)

## 📁 src\usecases\user\create

- **create-user.usecase.ts** (1.7KB)

## 📁 src\usecases\user\find-by-id

- **find-user.usecase.ts** (1.5KB)

## 📁 src\usecases\user\list-users

- **list-users.usecase.ts** (2.7KB)

## 📁 src\usecases\user\login

- **login-user.usecase.ts** (1.9KB)

## 📁 src\usecases\user\me

- **me-user.usecase.ts** (1.3KB)

## 📁 src\usecases\user\moderator-update

- **moderator-update-user.usecase.ts** (2.5KB)

## 📁 src\usecases\user\refresh-auth-token

- **refresh-auth-token-user.usecase.ts** (1.5KB)

## 📁 src\usecases\user\update-profile

- **update-user-profile.usecase.ts** (2.5KB)

## 📁 test

- **app.e2e-spec.ts** (699B)
- **jest-e2e.json** (192B)


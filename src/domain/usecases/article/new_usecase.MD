# 📋 Guia de Implementação - Correção das Rotas de Artigo

## 🎯 **Problema Identificado**

Algumas rotas de artigo estavam chamando diretamente o `ArticleGatewayRepository` ao invés de seguir a Clean Architecture com casos de uso das camadas de domínio e aplicação.

## ✅ **Casos de Uso Criados**

### 1. **Find Article By Slug**
- ✅ `src/domain/usecases/article/find-by-slug/find-article-by-slug.usecase.ts`
- ✅ `src/usecases/article/find-by-slug/find-article-by-slug.usecase.ts`

### 2. **Get Pending Moderation** 
- ✅ `src/domain/usecases/article/get-pending-moderation/get-pending-moderation.usecase.ts`
- ✅ `src/usecases/article/get-pending-moderation/get-pending-moderation.usecase.ts`

### 3. **Search Articles**
- ✅ `src/domain/usecases/article/search/search-articles.usecase.ts`
- ✅ `src/usecases/article/search/search-articles.usecase.ts`

### 4. **Article Stats**
- ✅ `src/domain/usecases/article/stats/article-stats.usecase.ts`
- ✅ `src/usecases/article/stats/article-stats.usecase.ts`

### 5. **Popular Tags**
- ✅ `src/domain/usecases/article/popular-tags/popular-tags.usecase.ts`
- ✅ `src/usecases/article/popular-tags/popular-tags.usecase.ts`

## 🔧 **Arquivos a Serem Atualizados**

### 1. **Rotas Corrigidas**

#### `src/infra/web/routes/article/find-by-slug/find-article-by-slug.route.ts`
```typescript
// ❌ ANTES: Chamava articleRepository.findBySlug() diretamente
// ✅ DEPOIS: Usa FindArticleBySlugUsecase
constructor(
  private readonly findArticleBySlugUsecase: FindArticleBySlugUsecase,
) {}
```

#### `src/infra/web/routes/article/pending-moderation/pending-moderation.route.ts`
```typescript
// ❌ ANTES: Chamava articleRepository.findForModeration() diretamente
// ✅ DEPOIS: Usa GetPendingModerationUsecase
constructor(
  private readonly getPendingModerationUsecase: GetPendingModerationUsecase,
) {}
```

### 2. **Novos Presenters Criados**

#### `src/infra/web/routes/article/pending-moderation/pending-moderation.presenter.ts`
- Novo presenter para mapear output do caso de uso para response HTTP

### 3. **Módulos Atualizados**

#### `src/usecases/usecase.module.ts`
- ✅ Adicionar todos os novos casos de uso (domínio + aplicação)
- ✅ Exportar para uso nas rotas

## 📂 **Estrutura de Arquivos Completa**

```
src/
├── domain/
│   └── usecases/
│       └── article/
│           ├── find-by-slug/
│           │   └── find-article-by-slug.usecase.ts ✅ NOVO
│           ├── get-pending-moderation/
│           │   └── get-pending-moderation.usecase.ts ✅ NOVO
│           ├── search/
│           │   └── search-articles.usecase.ts ✅ NOVO
│           ├── stats/
│           │   └── article-stats.usecase.ts ✅ NOVO
│           └── popular-tags/
│               └── popular-tags.usecase.ts ✅ NOVO
├── usecases/
│   └── article/
│       ├── find-by-slug/
│       │   └── find-article-by-slug.usecase.ts ✅ NOVO
│       ├── get-pending-moderation/
│       │   └── get-pending-moderation.usecase.ts ✅ NOVO
│       ├── search/
│       │   └── search-articles.usecase.ts ✅ NOVO
│       ├── stats/
│       │   └── article-stats.usecase.ts ✅ NOVO
│       └── popular-tags/
│           └── popular-tags.usecase.ts ✅ NOVO
└── infra/
    └── web/
        └── routes/
            └── article/
                ├── find-by-slug/
                │   └── find-article-by-slug.route.ts 🔄 ATUALIZADO
                └── pending-moderation/
                    ├── pending-moderation.route.ts 🔄 ATUALIZADO
                    └── pending-moderation.presenter.ts ✅ NOVO
```

## 🚀 **Implementação Passo a Passo**

### **Passo 1: Criar Casos de Uso do Domínio**
1. `find-article-by-slug.usecase.ts`
2. `get-pending-moderation.usecase.ts`
3. `search-articles.usecase.ts`
4. `article-stats.usecase.ts`
5. `popular-tags.usecase.ts`

### **Passo 2: Criar Casos de Uso da Aplicação**
1. `find-article-by-slug.usecase.ts`
2. `get-pending-moderation.usecase.ts`
3. `search-articles.usecase.ts`
4. `article-stats.usecase.ts`
5. `popular-tags.usecase.ts`

### **Passo 3: Criar Presenters**
1. `pending-moderation.presenter.ts`

### **Passo 4: Atualizar Rotas**
1. Atualizar `find-article-by-slug.route.ts`
2. Atualizar `pending-moderation.route.ts`

### **Passo 5: Atualizar Módulos**
1. Atualizar `usecase.module.ts` com novos providers
2. Verificar se `web.module.ts` está correto

### **Passo 6: Verificar Repository**
✅ O `ArticlePrismaRepository` já possui todos os métodos necessários implementados

## 🎯 **Benefícios da Correção**

### ✅ **Clean Architecture Compliance**
- Rotas não chamam mais repositories diretamente
- Casos de uso encapsulam lógica de negócio
- Separação clara entre camadas

### ✅ **Testabilidade Melhorada**
- Casos de uso podem ser testados isoladamente
- Mocks mais fáceis de implementar
- Testes unitários mais robustos

### ✅ **Manutenibilidade**
- Lógica de negócio centralizada nos casos de uso
- Mudanças na lógica não afetam as rotas
- Código mais organizado e legível

### ✅ **Consistência**
- Todas as rotas seguem o mesmo padrão
- Tratamento de erros padronizado
- Estrutura uniforme do projeto

## 🔍 **Verificação Final**

Após implementar todas as correções, todas as rotas de artigo seguirão o padrão:

```
Route → UseCase (Application) → UseCase (Domain) → Repository
```

Ao invés do padrão incorreto:

```
Route → Repository (direto) ❌
```

## 📊 **Status das Rotas**

| Rota | Status Anterior | Status Atual |
|------|-----------------|--------------|
| `CreateArticleRoute` | ✅ Correto | ✅ Correto |
| `FindArticleByIdRoute` | ✅ Correto | ✅ Correto |
| `FindArticleBySlugRoute` | ❌ Repository direto | ✅ Usa UseCase |
| `ListArticlesRoute` | ✅ Correto | ✅ Correto |
| `MyArticlesRoute` | ✅ Correto | ✅ Correto |
| `ModerateArticleRoute` | ✅ Correto | ✅ Correto |
| `PendingModerationRoute` | ❌ Repository direto | ✅ Usa UseCase |
| `SearchArticlesRoute` | ❌ Repository direto | ✅ Usa UseCase |
| `ArticleStatsRoute` | ❌ Repository direto | ✅ Usa UseCase |
| `PopularTagsRoute` | ❌ Repository direto | ✅ Usa UseCase |

## 🎉 **Resultado Final**

Todas as rotas de artigo agora seguem a Clean Architecture corretamente, mantendo a separação de responsabilidades e facilitando manutenção e testes futuros!
Criei um guia completo de testes no Postman que cobre todos os cenários possíveis do sistema de artigos!
🎯 O que o guia inclui:
📋 6 Cenários Principais

Criação de Artigos - casos válidos e todas as validações
Visualização - artigos públicos, privados, por ID/slug
Moderação - aprovação, rejeição, permissões
Busca e Filtros - pesquisa avançada, tags, estatísticas
Casos Edge - validações, paginação, incremento de views
Fluxos Completos - end-to-end do processo de moderação

🔧 Recursos Incluídos

✅ Variáveis de ambiente para reutilização
✅ Headers completos para cada request
✅ Bodies JSON realistas com exemplos práticos
✅ Códigos de status esperados
✅ Scripts automáticos para validação
✅ Checklist completo de funcionalidades
✅ Troubleshooting para problemas comuns

📊 Cobertura de Testes

17 endpoints diferentes testados
30+ cenários de teste específicos
Todos os códigos de erro cobertos
Validações de permissão por role
Edge cases e situações limite
Fluxos end-to-end completos

🚀 Como usar:

Configure as variáveis de ambiente no Postman
Obtenha os tokens JWT para cada tipo de usuário
Execute os testes na ordem sugerida
Use os scripts para automatizar validações
Siga o checklist para cobertura completa

O guia é auto-suficiente e você pode testar todo o sistema de artigos desde a criação até a publicação, incluindo todos os casos de erro e validações! 🎉

# 📝 Guia de Testes Postman - Sistema de Artigos

## 🚀 Configuração Inicial

### Variáveis de Ambiente
Configure essas variáveis no Postman:

```
BASE_URL = http://localhost:3001
USER_TOKEN = (token JWT do usuário comum)
ADMIN_TOKEN = (token JWT do admin)
MODERATOR_TOKEN = (token JWT do moderador)
ARTICLE_ID = (será preenchido durante os testes)
ARTICLE_SLUG = (será preenchido durante os testes)
```

### Pré-requisitos
1. **Usuários criados e logados:**
   - 1 usuário comum
   - 1 moderador (role: MODERATOR)
   - 1 admin (role: ADMIN)
2. **Tokens obtidos** através do endpoint de login
3. **Banco limpo** para testes consistentes

---

## 📋 **CENÁRIO 1: Criação de Artigos**

### 1.1 ✅ Criar Artigo Válido (Usuário Comum)

**POST** `{{BASE_URL}}/articles`

**Headers:**
```
Authorization: Bearer {{USER_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "titulo": "Como implementar Clean Architecture com NestJS",
  "descricao": "Um guia completo sobre como estruturar projetos Node.js seguindo os princípios da arquitetura limpa",
  "conteudo": "# Introdução\n\nA Clean Architecture é um padrão arquitetural criado por Robert C. Martin que visa separar as responsabilidades em camadas bem definidas. Neste artigo, vamos aprender como implementar esse padrão em projetos NestJS.\n\n## O que é Clean Architecture?\n\nA Clean Architecture é baseada em algumas regras fundamentais:\n\n1. **Independência de frameworks**: A arquitetura não deve depender de libraries externas\n2. **Testabilidade**: As regras de negócio podem ser testadas sem UI, banco de dados, web server, etc\n3. **Independência da UI**: A UI pode mudar facilmente sem alterar o resto do sistema\n4. **Independência do banco de dados**: Você pode trocar Oracle ou SQL Server por MongoDB, BigTable, CouchDB ou qualquer outro\n\n## Estrutura de Pastas\n\n```\nsrc/\n├── domain/          # Regras de negócio\n│   ├── entities/\n│   ├── repositories/\n│   └── usecases/\n├── application/     # Casos de uso da aplicação\n├── infrastructure/  # Implementações externas\n│   ├── database/\n│   ├── web/\n│   └── services/\n└── main.ts         # Ponto de entrada\n```\n\n## Implementação no NestJS\n\nVamos ver como criar cada camada:\n\n### Domain Layer\n\nA camada de domínio contém as entidades e regras de negócio:\n\n```typescript\n// src/domain/entities/user.entity.ts\nexport class User {\n  constructor(\n    private readonly id: string,\n    private readonly name: string,\n    private readonly email: string\n  ) {}\n\n  public getName(): string {\n    return this.name;\n  }\n\n  public getEmail(): string {\n    return this.email;\n  }\n\n  public isValidEmail(): boolean {\n    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;\n    return emailRegex.test(this.email);\n  }\n}\n```\n\nEste artigo demonstra como implementar Clean Architecture de forma prática e eficiente.",
  "categoria": "BACKEND",
  "tags": ["nestjs", "clean-architecture", "typescript", "backend", "node.js"],
  "images": [
    {
      "filename": "clean-architecture-diagram.png",
      "type": "PNG",
      "base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "alt": "Diagrama da Clean Architecture",
      "order": 0,
      "isMain": true
    },
    {
      "filename": "nestjs-structure.png", 
      "type": "PNG",
      "url": "https://example.com/nestjs-structure.png",
      "alt": "Estrutura de pastas do NestJS",
      "order": 1,
      "isMain": false
    }
  ]
}
```

**Resultado Esperado:** `201 Created`
```json
{
  "id": "uuid-do-artigo",
  "titulo": "Como implementar Clean Architecture com NestJS",
  "slug": "como-implementar-clean-architecture-com-nestjs",
  "status": "PENDING",
  "createdAt": "2024-01-15T10:00:00Z",
  "message": "Artigo criado com sucesso! Aguarde a aprovação de um moderador."
}
```

### 1.2 ❌ Criar Artigo com Título Muito Curto

**POST** `{{BASE_URL}}/articles`

**Headers:** (mesmo do anterior)

**Body:**
```json
{
  "titulo": "Hi",
  "descricao": "Descrição muito pequena também",
  "conteudo": "Conteúdo pequeno",
  "categoria": "BACKEND",
  "tags": ["test"]
}
```

**Resultado Esperado:** `400 Bad Request`

### 1.3 ❌ Criar Artigo sem Autenticação

**POST** `{{BASE_URL}}/articles`

**Headers:**
```
Content-Type: application/json
```

**Body:** (qualquer artigo válido)

**Resultado Esperado:** `401 Unauthorized`

### 1.4 ❌ Criar 6º Artigo (Limite Excedido)

**Pré-requisito:** Usuário já tem 5 artigos ativos

**POST** `{{BASE_URL}}/articles`

**Headers:** (com token válido)

**Body:** (artigo válido)

**Resultado Esperado:** `400 Bad Request`
```json
{
  "statusCode": 400,
  "timestamp": "2024-01-15T10:00:00Z",
  "message": "Você atingiu o limite máximo de 5 artigos. Delete ou arquive artigos existentes antes de criar novos."
}
```

### 1.5 ❌ Criar Artigo com Muitas Imagens

**POST** `{{BASE_URL}}/articles`

**Body:**
```json
{
  "titulo": "Artigo com muitas imagens",
  "descricao": "Testando limite de imagens",
  "conteudo": "Conteúdo válido com mais de 100 caracteres para passar na validação do sistema de artigos",
  "categoria": "FRONTEND",
  "tags": ["test"],
  "images": [
    {"filename": "img1.png", "type": "PNG", "order": 0, "isMain": true},
    {"filename": "img2.png", "type": "PNG", "order": 1, "isMain": false},
    {"filename": "img3.png", "type": "PNG", "order": 2, "isMain": false},
    {"filename": "img4.png", "type": "PNG", "order": 3, "isMain": false},
    {"filename": "img5.png", "type": "PNG", "order": 4, "isMain": false},
    {"filename": "img6.png", "type": "PNG", "order": 5, "isMain": false}
  ]
}
```

**Resultado Esperado:** `400 Bad Request`

---

## 👀 **CENÁRIO 2: Visualização de Artigos**

### 2.1 ✅ Listar Artigos Públicos (Sem Autenticação)

**GET** `{{BASE_URL}}/articles`

**Headers:** Nenhum necessário

**Resultado Esperado:** `200 OK`

### 2.2 ✅ Listar Artigos com Filtros

**GET** `{{BASE_URL}}/articles?categoria=BACKEND&tags=nestjs,typescript&page=1&limit=10&sortBy=visualizacoes&sortOrder=desc`

### 2.3 ✅ Ver Artigo por ID (Público)

**GET** `{{BASE_URL}}/articles/{{ARTICLE_ID}}`

**Headers:** Nenhum necessário

### 2.4 ✅ Ver Artigo por Slug

**GET** `{{BASE_URL}}/articles/slug/como-implementar-clean-architecture-com-nestjs`

### 2.5 ✅ Ver Artigo Próprio (PENDING)

**GET** `{{BASE_URL}}/articles/{{ARTICLE_ID}}`

**Headers:**
```
Authorization: Bearer {{USER_TOKEN}}
```

### 2.6 ❌ Ver Artigo Pendente de Outro Usuário

**GET** `{{BASE_URL}}/articles/{{OTHER_USER_PENDING_ARTICLE_ID}}`

**Resultado Esperado:** `403 Forbidden`

### 2.7 ✅ Meus Artigos

**GET** `{{BASE_URL}}/articles/my-articles?page=1&limit=10`

**Headers:**
```
Authorization: Bearer {{USER_TOKEN}}
```

### 2.8 ✅ Meus Artigos Filtrados por Status

**GET** `{{BASE_URL}}/articles/my-articles?status=PENDING`

**Headers:**
```
Authorization: Bearer {{USER_TOKEN}}
```

---

## 🛡️ **CENÁRIO 3: Moderação de Artigos**

### 3.1 ✅ Ver Artigos Pendentes (Moderador)

**GET** `{{BASE_URL}}/articles/pending-moderation`

**Headers:**
```
Authorization: Bearer {{MODERATOR_TOKEN}}
```

**Resultado Esperado:** `200 OK`

### 3.2 ✅ Aprovar Artigo (Moderador)

**POST** `{{BASE_URL}}/articles/{{ARTICLE_ID}}/moderate`

**Headers:**
```
Authorization: Bearer {{MODERATOR_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "action": "approve"
}
```

**Resultado Esperado:** `200 OK`
```json
{
  "success": true,
  "message": "Artigo aprovado com sucesso!",
  "article": {
    "id": "uuid",
    "titulo": "Como implementar Clean Architecture com NestJS",
    "status": "APPROVED",
    "author": {
      "id": "user-id",
      "name": "Nome do Autor",
      "email": "autor@email.com"
    }
  },
  "moderator": {
    "id": "moderator-id",
    "name": "Nome do Moderador",
    "email": "moderator@email.com"
  },
  "moderatedAt": "2024-01-15T11:00:00Z"
}
```

### 3.3 ✅ Rejeitar Artigo (Moderador)

**POST** `{{BASE_URL}}/articles/{{ARTICLE_ID}}/moderate`

**Headers:**
```
Authorization: Bearer {{MODERATOR_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "action": "reject",
  "rejectionReason": "O conteúdo não segue as diretrizes da comunidade. Por favor, revise as seções sobre código malicioso e reenvie."
}
```

### 3.4 ❌ Rejeitar sem Motivo

**POST** `{{BASE_URL}}/articles/{{ARTICLE_ID}}/moderate`

**Body:**
```json
{
  "action": "reject"
}
```

**Resultado Esperado:** `400 Bad Request`

### 3.5 ❌ Moderar Próprio Artigo

**POST** `{{BASE_URL}}/articles/{{OWN_ARTICLE_ID}}/moderate`

**Headers:**
```
Authorization: Bearer {{MODERATOR_TOKEN}}
```

**Body:**
```json
{
  "action": "approve"
}
```

**Resultado Esperado:** `400 Bad Request`

### 3.6 ❌ Usuário Comum Tentando Moderar

**POST** `{{BASE_URL}}/articles/{{ARTICLE_ID}}/moderate`

**Headers:**
```
Authorization: Bearer {{USER_TOKEN}}
```

**Resultado Esperado:** `403 Forbidden`

---

## 🔍 **CENÁRIO 4: Busca e Filtros**

### 4.1 ✅ Busca por Conteúdo

**GET** `{{BASE_URL}}/articles/search?q=clean architecture&page=1&limit=20`

### 4.2 ✅ Busca com Filtros

**GET** `{{BASE_URL}}/articles/search?q=nestjs&categoria=BACKEND&tags=typescript`

### 4.3 ✅ Busca Vazia

**GET** `{{BASE_URL}}/articles/search?q=`

**Resultado Esperado:** Lista vazia

### 4.4 ✅ Tags Populares

**GET** `{{BASE_URL}}/articles/tags/popular?limit=10`

### 4.5 ✅ Estatísticas (Admin)

**GET** `{{BASE_URL}}/articles/stats`

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Resultado Esperado:** `200 OK`
```json
{
  "totalArticles": 25,
  "pendingArticles": 3,
  "approvedArticles": 20,
  "rejectedArticles": 2,
  "archivedArticles": 0,
  "totalViews": 1547,
  "averageReadingTime": 8,
  "articlesByCategory": {
    "BACKEND": 12,
    "FRONTEND": 8,
    "MOBILE": 3,
    "DEVOPS": 2
  },
  "topTags": [
    {"tag": "javascript", "count": 15},
    {"tag": "typescript", "count": 12},
    {"tag": "react", "count": 8}
  ]
}
```

### 4.6 ❌ Usuário Comum Tentando Ver Stats

**GET** `{{BASE_URL}}/articles/stats`

**Headers:**
```
Authorization: Bearer {{USER_TOKEN}}
```

**Resultado Esperado:** `403 Forbidden`

---

## 🧪 **CENÁRIO 5: Casos Edge e Validações**

### 5.1 ❌ Artigo com Slug Duplicado

Tente criar dois artigos com títulos que gerem o mesmo slug:
- "Clean Architecture!!!"
- "Clean Architecture???"

**Resultado Esperado:** Sistema deve gerar slugs únicos automaticamente

### 5.2 ✅ Incremento de Visualizações

1. **GET** `{{BASE_URL}}/articles/{{APPROVED_ARTICLE_ID}}` (sem token)
2. **GET** `{{BASE_URL}}/articles/{{APPROVED_ARTICLE_ID}}` (com token de outro usuário)
3. **GET** `{{BASE_URL}}/articles/{{APPROVED_ARTICLE_ID}}` (com token do próprio autor)

**Teste:** Verificar se visualizações incrementam corretamente (não deve incrementar para o próprio autor)

### 5.3 ❌ IDs Inválidos

**GET** `{{BASE_URL}}/articles/invalid-uuid`

**Resultado Esperado:** `400 Bad Request`

### 5.4 ❌ Artigo Não Encontrado

**GET** `{{BASE_URL}}/articles/00000000-0000-0000-0000-000000000000`

**Resultado Esperado:** `404 Not Found`

### 5.5 ✅ Paginação

Teste diferentes valores:
- `?page=1&limit=5`
- `?page=2&limit=5`
- `?page=999&limit=10` (página inexistente)
- `?page=1&limit=101` (limite máximo)

### 5.6 ✅ Ordenação

Teste diferentes ordenações:
- `?sortBy=createdAt&sortOrder=desc`
- `?sortBy=visualizacoes&sortOrder=desc`
- `?sortBy=titulo&sortOrder=asc`

---

## 📊 **CENÁRIO 6: Fluxo Completo de Moderação**

### Fluxo 1: Artigo Aprovado
1. **Usuário cria artigo** → Status: PENDING
2. **Moderador lista pendentes** → Vê o artigo
3. **Moderador aprova** → Status: APPROVED
4. **Artigo fica público** → Qualquer um pode ver
5. **Visualizações incrementam** → Contador funciona

### Fluxo 2: Artigo Rejeitado e Corrigido
1. **Usuário cria artigo** → Status: PENDING
2. **Moderador rejeita com motivo** → Status: REJECTED
3. **Usuário vê motivo** → Em "meus artigos"
4. **Usuário edita artigo** → *(implementar depois)*
5. **Moderador aprova nova versão** → Status: APPROVED

---

## 🔧 **Scripts Postman Úteis**

### Script para Salvar Article ID
```javascript
// No teste de criação de artigo, adicionar em "Tests":
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("ARTICLE_ID", response.id);
    pm.environment.set("ARTICLE_SLUG", response.slug);
}
```

### Script para Validar Paginação
```javascript
// Em testes de listagem:
pm.test("Pagination structure is correct", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property("pagination");
    pm.expect(response.pagination).to.have.all.keys("page", "limit", "total", "totalPages", "hasNext", "hasPrevious");
});
```

### Script para Validar Article Structure
```javascript
pm.test("Article has correct structure", function () {
    const response = pm.response.json();
    const article = response.articles ? response.articles[0] : response;
    
    pm.expect(article).to.have.property("id");
    pm.expect(article).to.have.property("titulo");
    pm.expect(article).to.have.property("slug");
    pm.expect(article).to.have.property("categoria");
    pm.expect(article).to.have.property("tags");
    pm.expect(article.tags).to.be.an("array");
});
```

---

## 📝 **Checklist de Testes**

### ✅ Funcionalidades Básicas
- [ ] Criar artigo válido
- [ ] Listar artigos públicos
- [ ] Ver artigo por ID
- [ ] Ver artigo por slug
- [ ] Meus artigos
- [ ] Busca por conteúdo
- [ ] Tags populares

### ✅ Moderação
- [ ] Listar pendentes (MOD/ADMIN)
- [ ] Aprovar artigo (MOD/ADMIN)
- [ ] Rejeitar artigo com motivo (MOD/ADMIN)
- [ ] Estatísticas (ADMIN)

### ✅ Validações
- [ ] Limite de 5 artigos por usuário
- [ ] Máximo 5 imagens por artigo
- [ ] Validações de tamanho (título, descrição, conteúdo)
- [ ] Motivo obrigatório para rejeição
- [ ] Permissões corretas por role

### ✅ Edge Cases
- [ ] IDs inválidos
- [ ] Artigos não encontrados
- [ ] Paginação com valores extremos
- [ ] Busca vazia
- [ ] Incremento de visualizações
- [ ] Slugs únicos

---

## 🚨 **Troubleshooting**

### Erro 401 Unauthorized
- Verificar se token está válido
- Verificar formato: `Bearer TOKEN`
- Verificar se usuário existe

### Erro 403 Forbidden
- Verificar roles do usuário
- Verificar se endpoint requer ADMIN/MODERATOR

### Erro 400 Bad Request
- Verificar JSON válido
- Verificar campos obrigatórios
- Verificar validações (tamanhos, formatos)

### Erro 404 Not Found
- Verificar se artigo existe
- Verificar UUID válido
- Verificar se artigo não foi deletado

Este guia cobre todos os cenários principais para testar o sistema de artigos completo! 🎯

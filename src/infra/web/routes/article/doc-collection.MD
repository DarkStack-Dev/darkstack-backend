# 🚀 Guia Completo - DarkStack API Testing

## 📦 O que você vai importar

**2 arquivos apenas:**
1. `darkstack-environment.json` - Variáveis de ambiente
2. `darkstack-complete-collection.json` - Collection completa com tudo

**O que está incluso:**
- ✅ Autenticação (login, tokens, refresh)
- ✅ Artigos (CRUD, busca, moderação, estatísticas)
- ✅ Comentários (CRUD, threads, moderação)
- ✅ WebSocket (tempo real, notificações)
- ✅ Testes avançados (segurança, performance, edge cases)
- ✅ Scripts automáticos (validações, relatórios)

---

## 🛠️ Importação no Postman

### Passo 1: Importar os Arquivos

1. **Abra o Postman**
2. **Clique em Import** (botão azul no canto superior esquerdo)
3. **Arraste os 2 arquivos JSON** ou clique em "Upload Files"
4. **Confirme a importação**

### Passo 2: Configurar Environment

1. **No canto superior direito**, selecione **"DarkStack API Environment"**
2. **Verifique se `baseUrl` está correto**: `http://localhost:3001`
3. **As outras variáveis** serão preenchidas automaticamente

### Passo 3: Verificar Importação

Você deve ver:
- ✅ Environment: "DarkStack API Environment"
- ✅ Collection: "DarkStack Complete API Collection" com 9 pastas

---

## 🎯 Ordem de Execução (IMPORTANTE!)

### 📋 Execução Sequencial Recomendada

```
1. 🔐 1. AUTENTICAÇÃO
   ├── Create Regular User
   ├── Create Moderator User  
   ├── Login as Regular User ⭐ (OBRIGATÓRIO primeiro)
   ├── Login as Moderator ⭐ (OBRIGATÓRIO)
   └── Get My Profile

2. 📝 2. ARTIGOS - CRUD
   ├── Create Article ⭐ (salva testArticleId)
   ├── Get Article by ID
   ├── Get Article by Slug
   ├── Update Article
   └── Delete Article (opcional)

3. 📋 3. ARTIGOS - BUSCA E LISTAGEM
   ├── List All Articles
   ├── My Articles
   ├── Search Articles
   └── Popular Tags

4. 🛡️ 4. ARTIGOS - MODERAÇÃO (token moderador)
   ├── Pending Articles for Moderation
   ├── Approve Article ⭐ (usar moderatorToken)
   ├── Reject Article
   └── Article Statistics

5. 💬 5. COMENTÁRIOS - CRUD
   ├── Create Root Comment ⭐ (salva testCommentId)
   ├── Create Reply Comment
   ├── Update Comment
   └── Delete Comment

6. 📋 6. COMENTÁRIOS - LISTAGEM
   ├── List Comments for Article
   ├── Count Comments
   └── Find Replies to Comment

7. 🛡️ 7. COMENTÁRIOS - MODERAÇÃO
   ├── Pending Comments for Moderation
   ├── Approve Comment
   ├── Reject Comment
   └── Comment Statistics

8. 🔌 8. WEBSOCKET - TEMPO REAL
   ├── WebSocket Status
   ├── WebSocket Health Check
   ├── Test: Create Article (Triggers Real-time)
   ├── Test: Create Comment (Triggers Real-time)
   └── Test: Approve Article (Triggers Notification)

9. 🧪 9. TESTES AVANÇADOS
   ├── Create Article with Invalid Data
   ├── Create Comment with XSS Attempt
   ├── Regular User Try to Moderate
   ├── Search Performance Test
   ├── View Count Accuracy Test
   └── Generate Test Report ⭐ (executar por último)
```

---

## 🔌 Como Configurar WebSocket no Postman

### ⚠️ IMPORTANTE: Use Postman Desktop

**WebSocket NÃO funciona no Postman Web!** Baixe o Postman Desktop.

### Passo 1: Criar Conexão WebSocket

1. **Postman Desktop** → **New** → **WebSocket Request**
2. **URL**: `ws://localhost:3001/notifications`

### Passo 2: Autenticação

**Escolha uma das opções:**

**Opção A: Query Parameter**
```
ws://localhost:3001/notifications?token=SEU_TOKEN_AQUI
```

**Opção B: Headers**
```
Authorization: Bearer SEU_TOKEN_AQUI
```

### Passo 3: Conectar

1. **Clique em "Connect"**
2. **Aguarde mensagem de confirmação**:
```json
{
  "type": "connected",
  "message": "Conectado ao sistema de notificações",
  "userId": "seu-user-id",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Passo 4: Testar Mensagens

**Ping/Pong (heartbeat):**
```json
{
  "event": "ping"
}
```

**Entrar na sala de moderadores:**
```json
{
  "event": "joinRoom",
  "data": {
    "room": "moderators"
  }
}
```

**Assistir artigo específico:**
```json
{
  "event": "watchEntity",
  "data": {
    "targetType": "ARTICLE",
    "targetId": "COLE_AQUI_O_ID_DO_ARTIGO"
  }
}
```

---

## 🎬 Cenários de Teste em Tempo Real

### 🎯 Cenário 1: Fluxo Completo de Artigo

**Setup:**
- **WebSocket 1**: Moderador (para receber solicitações)
- **WebSocket 2**: Usuário comum (para receber aprovações)

**Passos:**
1. **Conectar ambos WebSockets**
2. **Moderador envia**: `{"event": "joinRoom", "data": {"room": "moderators"}}`
3. **Usuário cria artigo** via Collection (seção 2)
4. **Moderador recebe**: evento `newModerationRequest`
5. **Moderador aprova** via Collection (seção 4)
6. **Usuário recebe**: evento `newNotification` de aprovação

### 🎯 Cenário 2: Comentários em Tempo Real

**Setup:**
- **WebSocket 1**: Usuário A (assiste artigo)
- **WebSocket 2**: Usuário B (comenta)

**Passos:**
1. **Usuário A envia**: `{"event": "watchEntity", "data": {"targetType": "ARTICLE", "targetId": "ID_ARTIGO"}}`
2. **Usuário B cria comentário** via Collection (seção 5)
3. **Usuário A recebe**: evento `newComment`
4. **Usuário B edita comentário** via Collection
5. **Ambos recebem**: evento `commentUpdated`

---

## 📊 Eventos WebSocket que Você Receberá

### 🔔 Nova Notificação
```json
{
  "type": "notification",
  "data": {
    "title": "Artigo aprovado! 🎉",
    "message": "Seu artigo foi aprovado...",
    "type": "ARTICLE_APPROVED",
    "relatedId": "article-id"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 🛡️ Solicitação de Moderação
```json
{
  "type": "moderation",
  "data": {
    "title": "Novo artigo aguardando moderação",
    "articleId": "article-id",
    "authorName": "João Silva"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 💬 Novo Comentário
```json
{
  "type": "NEW_COMMENT",
  "data": {
    "id": "comment-id",
    "content": "Excelente artigo!",
    "authorName": "Maria Santos",
    "targetId": "article-id"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## 🔧 Troubleshooting

### ❌ "Token não encontrado"
**Solução**: Execute primeiro os logins na seção "1. AUTENTICAÇÃO"

### ❌ "WebSocket não conecta"
**Soluções**:
- Use Postman Desktop (não web)
- Verifique se o servidor está rodando: `npm run start:dev`
- Confirme a URL: `ws://localhost:3001/notifications`
- Teste o health check na Collection

### ❌ "Forbidden" em moderação
**Solução**: Use o `{{moderatorToken}}` em vez de `{{authToken}}`

### ❌ "Article not found"
**Solução**: Execute primeiro "Create Article" para gerar o `testArticleId`

### ❌ Não recebe eventos WebSocket
**Verificações**:
- Está conectado corretamente?
- Entrou na sala correta? (moderators/article_ID)
- Servidor está rodando e healthy?

---

## 🎯 Fluxo de Teste Recomendado

### 🚀 Teste Rápido (5 min)
```
1. Executar toda seção "1. AUTENTICAÇÃO"
2. "Create Article" (seção 2)
3. "Approve Article" (seção 4) 
4. "Create Root Comment" (seção 5)
5. "WebSocket Health Check" (seção 8)
```

### 🔥 Teste Completo (20 min)
```
1. Executar TODAS as seções em ordem
2. Configurar WebSocket paralelo
3. Testar cenários tempo real
4. Verificar relatório final
```

### 🧪 Teste de Stress (30 min)
```
1. Executar teste completo
2. Repetir seções 2-7 múltiplas vezes
3. Testar casos de erro (seção 9)
4. Monitorar performance
```

---

## 📈 Métricas de Sucesso

**✅ Teste 100% OK quando:**
- Success rate > 80% no relatório final
- WebSocket conecta e recebe eventos
- Tempo de resposta < 2s na busca
- Moderação funciona corretamente
- Notificações em tempo real chegam

**🎉 Sistema pronto para produção!**

---

## 🆘 Ajuda Rápida

### 🔗 URLs importantes
- API Base: `http://localhost:3001`
- WebSocket: `ws://localhost:3001/notifications`
- Health: `http://localhost:3001/notifications/websocket/health`

### 🎫 Tokens necessários
- `{{authToken}}` - Usuário comum
- `{{moderatorToken}}` - Moderador
- `{{refreshToken}}` - Para renovar

### 📱 Variáveis principais
- `{{testArticleId}}` - ID do artigo de teste
- `{{testCommentId}}` - ID do comentário de teste
- `{{baseUrl}}` - URL base da API

### 🔌 WebSocket essencial
- **Desktop only**: Postman Web não funciona
- **Auth**: Query param ou header
- **Rooms**: `moderators`, `article_ID`
- **Events**: `ping`, `joinRoom`, `watchEntity`

---

**🎯 Pronto! Agora você tem tudo para testar completamente sua API DarkStack!**

**Dúvidas?** Execute o "Generate Test Report" no final para ver um resumo completo! 📊
// 4. Exemplo de uso completo das APIs

/**
 * 📋 GUIA DE USO DAS APIs DE ARTIGO
 * 
 * 1. CRIAR ARTIGO (POST /articles)
 * Autenticação: Bearer token obrigatório
 * Body:
 * {
 *   "titulo": "Como implementar Clean Architecture com NestJS",
 *   "descricao": "Um guia completo sobre implementação de arquitetura limpa",
 *   "conteudo": "# Introdução\n\nEste artigo explica como...",
 *   "categoria": "BACKEND",
 *   "tags": ["nestjs", "clean-architecture", "typescript"],
 *   "images": [
 *     {
 *       "filename": "diagram.png",
 *       "type": "PNG",
 *       "base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
 *       "alt": "Diagrama da arquitetura",
 *       "order": 0,
 *       "isMain": true
 *     }
 *   ]
 * }
 * 
 * Response:
 * {
 *   "id": "uuid",
 *   "titulo": "Como implementar Clean Architecture com NestJS",
 *   "slug": "como-implementar-clean-architecture-com-nestjs",
 *   "status": "PENDING",
 *   "createdAt": "2024-01-15T10:00:00Z",
 *   "message": "Artigo criado com sucesso! Aguarde a aprovação de um moderador."
 * }
 * 
 * 2. LISTAR ARTIGOS PÚBLICOS (GET /articles)
 * Autenticação: Opcional
 * Query params: ?page=1&limit=20&categoria=BACKEND&tags=nestjs,typescript&search=clean
 * 
 * 3. VER ARTIGO POR ID (GET /articles/:id)
 * Autenticação: Opcional
 * Query params: ?includeContent=true
 * 
 * 4. VER ARTIGO POR SLUG (GET /articles/slug/:slug)
 * Autenticação: Opcional
 * Exemplo: GET /articles/slug/como-implementar-clean-architecture-com-nestjs
 * 
 * 5. MEUS ARTIGOS (GET /articles/my-articles)
 * Autenticação: Bearer token obrigatório
 * Query params: ?page=1&limit=10&status=PENDING
 * 
 * 6. MODERAR ARTIGO (POST /articles/:id/moderate)
 * Autenticação: Bearer token obrigatório (ADMIN ou MODERATOR)
 * Body:
 * {
 *   "action": "approve" // ou "reject"
 *   "rejectionReason": "Conteúdo não segue as diretrizes da comunidade" // obrigatório se action=reject
 * }
 * 
 * 7. ARTIGOS PENDENTES DE MODERAÇÃO (GET /articles/pending-moderation)
 * Autenticação: Bearer token obrigatório (ADMIN ou MODERATOR)
 * Query params: ?includeOwn=false
 */

// 5. Comando para executar migração do banco
/**
 * Após implementar tudo, execute:
 * 
 * npx prisma generate
 * npx prisma db push
 * 
 * Ou se usando migrações:
 * npx prisma migrate dev --name add-article-schema
 */

// 6. Categorias disponíveis para artigos
/**
 * export enum ArticleCategory {
 *   FRONTEND     = 'FRONTEND',     // React, Vue, Angular, HTML, CSS, JS
 *   BACKEND      = 'BACKEND',      // Node.js, Python, Java, .NET, PHP
 *   MOBILE       = 'MOBILE',       // React Native, Flutter, Native
 *   DEVOPS       = 'DEVOPS',       // Docker, Kubernetes, AWS, CI/CD
 *   DATABASE     = 'DATABASE',     // SQL, NoSQL, MongoDB, PostgreSQL
 *   SECURITY     = 'SECURITY',     // Cibersegurança, Autenticação
 *   AI_ML        = 'AI_ML',        // Inteligência Artificial, Machine Learning
 *   BLOCKCHAIN   = 'BLOCKCHAIN',   // Criptomoedas, Smart Contracts
 *   CAREER       = 'CAREER',       // Carreira em TI, Soft Skills
 *   TOOLS        = 'TOOLS',        // IDEs, Ferramentas, Produtividade
 *   ARCHITECTURE = 'ARCHITECTURE', // Clean Architecture, Design Patterns
 *   OTHER        = 'OTHER'         // Outros tópicos
 * }
 */

// 7. Status possíveis dos artigos
/**
 * export enum ArticleStatus {
 *   PENDING   = 'PENDING',   // Aguardando aprovação
 *   APPROVED  = 'APPROVED',  // Aprovado e visível
 *   REJECTED  = 'REJECTED',  // Rejeitado pelos moderadores
 *   ARCHIVED  = 'ARCHIVED'   // Arquivado pelo autor
 * }
 */
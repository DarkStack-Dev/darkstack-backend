// 8. Documentação das APIs (README.md adicional)
/**
 * # 📝 Sistema de Artigos
 * 
 * ## Funcionalidades
 * 
 * - ✅ Usuários podem criar até 5 artigos
 * - ✅ Sistema de moderação (ADMIN/MODERATOR)
 * - ✅ Status: PENDING → APPROVED/REJECTED
 * - ✅ Categorias específicas para TI
 * - ✅ Sistema de tags
 * - ✅ Upload de imagens (máximo 5 por artigo)
 * - ✅ Slug automático para URLs amigáveis
 * - ✅ Cálculo automático de tempo de leitura
 * - ✅ Contador de visualizações
 * - ✅ Soft delete
 * - ✅ Busca por conteúdo
 * - ✅ Estatísticas completas
 * 
 * ## Endpoints Disponíveis
 * 
 * ### Públicos (sem autenticação)
 * - `GET /articles` - Listar artigos aprovados
 * - `GET /articles/:id` - Ver artigo por ID
 * - `GET /articles/slug/:slug` - Ver artigo por slug
 * - `GET /articles/search?q=termo` - Buscar artigos
 * - `GET /articles/tags/popular` - Tags populares
 * 
 * ### Autenticados (usuário logado)
 * - `POST /articles` - Criar artigo
 * - `GET /articles/my-articles` - Meus artigos
 * 
 * ### Moderação (ADMIN/MODERATOR)
 * - `GET /articles/pending-moderation` - Artigos pendentes
 * - `POST /articles/:id/moderate` - Aprovar/rejeitar artigo
 * - `GET /articles/stats` - Estatísticas (apenas ADMIN)
 * 
 * ## Regras de Negócio
 * 
 * 1. **Limite por usuário**: Máximo 5 artigos ativos
 * 2. **Moderação obrigatória**: Artigos começam como PENDING
 * 3. **Rejeição com motivo**: Artigos rejeitados devem ter justificativa
 * 4. **Edição limitada**: Apenas artigos PENDING/REJECTED podem ser editados
 * 5. **Imagens**: Máximo 5 por artigo, uma deve ser principal
 * 6. **Tags**: Pelo menos 1, máximo 10 por artigo
 * 7. **Conteúdo mínimo**: 100 caracteres no conteúdo
 */
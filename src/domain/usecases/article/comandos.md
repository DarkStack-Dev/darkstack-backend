// 6. Exemplo de comando de migração
/**
 * Execute os seguintes comandos após implementar tudo:
 * 
 * # 1. Gerar cliente Prisma atualizado
 * npx prisma generate
 * 
 * # 2. Aplicar mudanças no banco (desenvolvimento)
 * npx prisma db push
 * 
 * # 3. Ou criar uma migração (produção)
 * npx prisma migrate dev --name add-article-system
 * 
 * # 4. Verificar o banco com o Studio
 * npx prisma studio
 */

// 7. Exemplo de dados seed para testes
// prisma/seed.ts (adicionar ao seed existente)
/**
 * import { PrismaClient, ArticleStatus, ArticleCategory, ImageType } from 'generated/prisma';
 * 
 * const prisma = new PrismaClient();
 * 
 * async function seedArticles() {
 *   // Criar artigos de exemplo
 *   const user = await prisma.user.findFirst();
 *   if (!user) return;
 * 
 *   const articles = [
 *     {
 *       titulo: 'Introdução ao NestJS',
 *       slug: 'introducao-ao-nestjs',
 *       descricao: 'Aprenda os conceitos básicos do framework NestJS',
 *       conteudo: '# Introdução\n\nNestJS é um framework...',
 *       categoria: ArticleCategory.BACKEND,
 *       tags: ['nestjs', 'typescript', 'backend'],
 *       status: ArticleStatus.APPROVED,
 *       authorId: user.id,
 *       visualizacoes: 150,
 *       tempoLeituraMinutos: 8,
 *     },
 *     // Mais artigos...
 *   ];
 * 
 *   for (const articleData of articles) {
 *     await prisma.article.create({ data: articleData });
 *   }
 * }
 */
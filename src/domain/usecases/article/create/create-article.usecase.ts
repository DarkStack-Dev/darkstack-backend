// src/domain/usecases/article/create/create-article.usecase.ts - CORRIGIDO
import { Injectable } from '@nestjs/common';
import { UseCase } from '../../usecase';
import { ArticleGatewayRepository } from '@/domain/repositories/article/article.gateway.repository';
import { UserGatewayRepository } from '@/domain/repositories/user/user.gateway.repository';
import { Article, ArticleImageDto } from '@/domain/entities/article/article.entity';
import { UserNotFoundUsecaseException } from '../../exceptions/user/user-not-found.usecase.exception';
import { InvalidInputUsecaseException } from '../../exceptions/input/invalid-input.usecase.exception';
import { ArticleCategory } from 'generated/prisma';
import { NotifyModeratorsUseCase } from '../../notification/notify-moderators/notify-moderators.usecase';
import { NotificationType } from 'generated/prisma';

export type CreateArticleInput = {
  titulo: string;
  descricao: string;
  conteudo: string;
  categoria: ArticleCategory;
  tags: string[];
  images: ArticleImageDto[];
  userId: string;
};

// ✅ CORRIGIDO: Adicionar propriedades que estavam faltando
export type CreateArticleOutput = {
  id: string;
  titulo: string;
  slug: string;
  status: string;
  createdAt: Date;
  moderatorsNotified: number; // ✅ ADICIONAR
  realTimeNotificationSent: boolean; // ✅ ADICIONAR
  message?: string; // ✅ ADICIONAR para compatibilidade
};

@Injectable()
export class CreateArticleUseCase implements UseCase<CreateArticleInput, CreateArticleOutput> {
  constructor(
    private readonly articleRepository: ArticleGatewayRepository,
    private readonly userRepository: UserGatewayRepository,
    private readonly notifyModeratorsUseCase: NotifyModeratorsUseCase,
  ) {}

  async execute({ titulo, descricao, conteudo, categoria, tags, images, userId }: CreateArticleInput): Promise<CreateArticleOutput> {
    // Validar entrada
    this.validateInput(titulo, descricao, conteudo, tags, images);

    // Verificar se usuário existe
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundUsecaseException(
        `User not found with id ${userId}`,
        'Usuário não encontrado',
        CreateArticleUseCase.name,
      );
    }

    // Verificar limite de artigos por usuário (máximo 5)
    const canCreate = await this.articleRepository.canUserCreateArticle(userId);
    if (!canCreate) {
      throw new InvalidInputUsecaseException(
        `User ${userId} has reached maximum article limit`,
        'Você atingiu o limite máximo de 5 artigos. Delete ou arquive artigos existentes antes de criar novos.',
        CreateArticleUseCase.name,
      );
    }

    // Criar entidade
    const article = Article.create({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      conteudo: conteudo.trim(),
      categoria,
      tags: tags.map(tag => tag.trim()).filter(tag => tag.length > 0),
      authorId: userId,
      images: images || [],
    });

    // Verificar se slug é único
    const isSlugUnique = await this.articleRepository.isSlugUnique(article.getSlug());
    let finalArticle = article;
    
    if (!isSlugUnique) {
      // Gerar slug alternativo
      const timestamp = Date.now();
      const newSlug = `${article.getSlug()}-${timestamp}`;
      // Recriar artigo com slug único
      finalArticle = Article.create({
        titulo: titulo.trim(),
        slug: newSlug,
        descricao: descricao.trim(),
        conteudo: conteudo.trim(),
        categoria,
        tags: tags.map(tag => tag.trim()).filter(tag => tag.length > 0),
        authorId: userId,
        images: images || [],
      });
    }

    // Persistir artigo
    await this.articleRepository.create(finalArticle);

    // ✅ NOTIFICAR MODERADORES SOBRE NOVO ARTIGO PENDENTE
    let moderatorsNotified = 0;
    let realTimeNotificationSent = false;
    
    try {
      const notificationResult = await this.notifyModeratorsUseCase.execute({
        type: NotificationType.ARTICLE_PENDING,
        relatedId: finalArticle.getId(),
        relatedType: 'ARTICLE',
        itemName: finalArticle.getTitulo(),
      });
      
      moderatorsNotified = notificationResult.notifiedCount;
      realTimeNotificationSent = notificationResult.realTimeSent > 0; // ✅ CORRIGIDO: converter para boolean
      
      console.log(`✅ [CreateArticleUseCase] Notified ${moderatorsNotified} moderators about new article ${finalArticle.getId()}`);
    } catch (error) {
      console.error(`❌ [CreateArticleUseCase] Failed to notify moderators about article ${finalArticle.getId()}:`, error);
    }

    // ✅ CORRIGIDO: Incluir todas as propriedades do output
    return {
      id: finalArticle.getId(),
      titulo: finalArticle.getTitulo(),
      slug: finalArticle.getSlug(),
      status: finalArticle.getStatus(),
      createdAt: finalArticle.getCreatedAt(),
      moderatorsNotified, // ✅ INCLUIR
      realTimeNotificationSent, // ✅ INCLUIR
      message: `Artigo criado com sucesso! ${moderatorsNotified} moderadores foram notificados.`, // ✅ OPCIONAL
    };
  }

  private validateInput(titulo: string, descricao: string, conteudo: string, tags: string[], images: ArticleImageDto[]): void {
    if (!titulo || titulo.trim().length < 5) {
      throw new InvalidInputUsecaseException(
        'Título deve ter pelo menos 5 caracteres',
        'Título deve ter pelo menos 5 caracteres',
        CreateArticleUseCase.name,
      );
    }

    if (!descricao || descricao.trim().length < 20) {
      throw new InvalidInputUsecaseException(
        'Descrição deve ter pelo menos 20 caracteres',
        'Descrição deve ter pelo menos 20 caracteres',
        CreateArticleUseCase.name,
      );
    }

    if (!conteudo || conteudo.trim().length < 100) {
      throw new InvalidInputUsecaseException(
        'Conteúdo deve ter pelo menos 100 caracteres',
        'Conteúdo deve ter pelo menos 100 caracteres',
        CreateArticleUseCase.name,
      );
    }

    if (!tags || tags.length === 0) {
      throw new InvalidInputUsecaseException(
        'Pelo menos uma tag é obrigatória',
        'Pelo menos uma tag é obrigatória',
        CreateArticleUseCase.name,
      );
    }

    if (images && images.length > 5) {
      throw new InvalidInputUsecaseException(
        'Máximo de 5 imagens permitidas',
        'Máximo de 5 imagens permitidas',
        CreateArticleUseCase.name,
      );
    }
  }
}
// src/domain/entities/article/article.entity.ts

import { Entity } from "@/domain/shared/entities/entity";
import { ArticleValidatorFactory } from "@/domain/validators/article/article.validator.factory";
import { Utils } from "@/shared/utils/utils";
import { ArticleStatus, ArticleCategory, ImageType } from "generated/prisma";

export type ArticleImageDto = {
  id?: string;
  filename: string;
  type: ImageType;
  size?: number;
  width?: number;
  height?: number;
  base64?: string;
  url?: string;
  alt?: string;
  metadata?: any;
  order: number;
  isMain: boolean;
};

export type ArticleCreateDto = {
  id?: string;
  titulo: string;
  slug?: string;
  descricao: string;
  conteudo: string;
  categoria: ArticleCategory;
  tags: string[];
  authorId: string;
  images: ArticleImageDto[];
  tempoLeituraMinutos?: number;
};

export type ArticleWithDto = {
  id: string;
  titulo: string;
  slug: string;
  descricao: string;
  conteudo: string;
  categoria: ArticleCategory;
  tags: string[];
  status: ArticleStatus;
  visualizacoes: number;
  tempoLeituraMinutos?: number;
  authorId: string;
  approvedById?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  images: ArticleImageDto[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  isActive: boolean;
};

export type ArticleUpdateDto = {
  titulo?: string;
  slug?: string;
  descricao?: string;
  conteudo?: string;
  categoria?: ArticleCategory;
  tags?: string[];
  images?: ArticleImageDto[];
  isActive?: boolean;
};

export type ArticleModerationDto = {
  status: ArticleStatus;
  approvedById?: string;
  rejectionReason?: string;
};

export class Article extends Entity {
  private titulo: string;
  private slug: string;
  private descricao: string;
  private conteudo: string;
  private categoria: ArticleCategory;
  private tags: string[];
  private status: ArticleStatus;
  private visualizacoes: number;
  private tempoLeituraMinutos?: number;
  private authorId: string;
  private approvedById?: string;
  private approvedAt?: Date;
  private rejectionReason?: string;
  private images: ArticleImageDto[];
  private deletedAt?: Date;

  protected constructor(
    id: string,
    titulo: string,
    slug: string,
    descricao: string,
    conteudo: string,
    categoria: ArticleCategory,
    tags: string[],
    status: ArticleStatus,
    visualizacoes: number,
    tempoLeituraMinutos: number | undefined,
    authorId: string,
    approvedById: string | undefined,
    approvedAt: Date | undefined,
    rejectionReason: string | undefined,
    images: ArticleImageDto[],
    createdAt: Date,
    updatedAt: Date,
    isActive: boolean,
    deletedAt?: Date
  ) {
    super(id, createdAt, updatedAt, isActive);
    this.titulo = titulo;
    this.slug = slug;
    this.descricao = descricao;
    this.conteudo = conteudo;
    this.categoria = categoria;
    this.tags = tags;
    this.status = status;
    this.visualizacoes = visualizacoes;
    this.tempoLeituraMinutos = tempoLeituraMinutos;
    this.authorId = authorId;
    this.approvedById = approvedById;
    this.approvedAt = approvedAt;
    this.rejectionReason = rejectionReason;
    this.images = images;
    this.deletedAt = deletedAt;
    this.validate();
  }

  public static create({
    id,
    titulo,
    slug,
    descricao,
    conteudo,
    categoria,
    tags,
    authorId,
    images,
    tempoLeituraMinutos,
  }: ArticleCreateDto): Article {
    const entityId = id || Utils.GenerateUUID();
    const now = new Date();
    
    // Gerar slug automaticamente se não fornecido
    const finalSlug = slug || this.generateSlug(titulo);
    
    // Calcular tempo de leitura se não fornecido (aproximadamente 200 palavras por minuto)
    const finalTempoLeitura = tempoLeituraMinutos || this.calculateReadingTime(conteudo);

    // Validar imagens
    this.validateImages(images);

    return new Article(
      entityId,
      titulo.trim(),
      finalSlug,
      descricao.trim(),
      conteudo.trim(),
      categoria,
      tags.map(tag => tag.trim()).filter(tag => tag.length > 0),
      ArticleStatus.PENDING,
      0, // visualizações iniciais
      finalTempoLeitura,
      authorId,
      undefined, // approvedById
      undefined, // approvedAt
      undefined, // rejectionReason
      images,
      now,
      now,
      true
    );
  }

  public static with({
    id,
    titulo,
    slug,
    descricao,
    conteudo,
    categoria,
    tags,
    status,
    visualizacoes,
    tempoLeituraMinutos,
    authorId,
    approvedById,
    approvedAt,
    rejectionReason,
    images,
    createdAt,
    updatedAt,
    isActive,
    deletedAt,
  }: ArticleWithDto): Article {
    return new Article(
      id,
      titulo,
      slug,
      descricao,
      conteudo,
      categoria,
      tags,
      status,
      visualizacoes,
      tempoLeituraMinutos,
      authorId,
      approvedById,
      approvedAt,
      rejectionReason,
      images,
      createdAt,
      updatedAt,
      isActive,
      deletedAt
    );
  }

  public update(updateData: ArticleUpdateDto): Article {
    const updatedTitulo = updateData.titulo?.trim() ?? this.titulo;
    const updatedDescricao = updateData.descricao?.trim() ?? this.descricao;
    const updatedConteudo = updateData.conteudo?.trim() ?? this.conteudo;
    const updatedCategoria = updateData.categoria ?? this.categoria;
    const updatedTags = updateData.tags?.map(tag => tag.trim()).filter(tag => tag.length > 0) ?? this.tags;
    const updatedImages = updateData.images ?? this.images;
    const updatedIsActive = updateData.isActive ?? this.isActive;
    
    // Regenerar slug se título mudou
    const updatedSlug = updateData.titulo ? Article.generateSlug(updatedTitulo) : this.slug;
    
    // Recalcular tempo de leitura se conteúdo mudou
    const updatedTempoLeitura = updateData.conteudo 
      ? Article.calculateReadingTime(updatedConteudo)
      : this.tempoLeituraMinutos;

    // Validar imagens se foram alteradas
    if (updateData.images) {
      Article.validateImages(updatedImages);
    }

    return new Article(
      this.id,
      updatedTitulo,
      updatedSlug,
      updatedDescricao,
      updatedConteudo,
      updatedCategoria,
      updatedTags,
      this.status, // Status só muda via moderação
      this.visualizacoes,
      updatedTempoLeitura,
      this.authorId,
      this.approvedById,
      this.approvedAt,
      this.rejectionReason,
      updatedImages,
      this.createdAt,
      new Date(),
      updatedIsActive,
      this.deletedAt
    );
  }

  public moderate({ status, approvedById, rejectionReason }: ArticleModerationDto): Article {
    const now = new Date();
    
    return new Article(
      this.id,
      this.titulo,
      this.slug,
      this.descricao,
      this.conteudo,
      this.categoria,
      this.tags,
      status,
      this.visualizacoes,
      this.tempoLeituraMinutos,
      this.authorId,
      status === ArticleStatus.APPROVED ? approvedById : this.approvedById,
      status === ArticleStatus.APPROVED ? now : this.approvedAt,
      status === ArticleStatus.REJECTED ? rejectionReason : undefined,
      this.images,
      this.createdAt,
      now,
      this.isActive,
      this.deletedAt
    );
  }

  public incrementViews(): Article {
    return new Article(
      this.id,
      this.titulo,
      this.slug,
      this.descricao,
      this.conteudo,
      this.categoria,
      this.tags,
      this.status,
      this.visualizacoes + 1,
      this.tempoLeituraMinutos,
      this.authorId,
      this.approvedById,
      this.approvedAt,
      this.rejectionReason,
      this.images,
      this.createdAt,
      new Date(),
      this.isActive,
      this.deletedAt
    );
  }

  public softDelete(): void {
    this.deletedAt = new Date();
    this.isActive = false;
  }

  public archive(): Article {
    return new Article(
      this.id,
      this.titulo,
      this.slug,
      this.descricao,
      this.conteudo,
      this.categoria,
      this.tags,
      ArticleStatus.ARCHIVED,
      this.visualizacoes,
      this.tempoLeituraMinutos,
      this.authorId,
      this.approvedById,
      this.approvedAt,
      this.rejectionReason,
      this.images,
      this.createdAt,
      new Date(),
      this.isActive,
      this.deletedAt
    );
  }

  // Validações estáticas
  private static generateSlug(titulo: string): string {
    return titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .trim()
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove múltiplos hífens
      .substring(0, 100); // Limita tamanho
  }

  private static calculateReadingTime(conteudo: string): number {
    const wordsPerMinute = 200;
    const wordCount = conteudo.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  private static validateImages(images: ArticleImageDto[]): void {
    if (images.length > 5) {
      throw new Error('Máximo de 5 imagens permitidas por artigo');
    }

    const mainImages = images.filter(img => img.isMain);
    if (mainImages.length > 1) {
      throw new Error('Apenas uma imagem pode ser marcada como principal');
    }

    // Validar ordem das imagens
    const orders = images.map(img => img.order);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      throw new Error('Cada imagem deve ter uma ordem única');
    }
  }

  protected validate(): void {
    ArticleValidatorFactory.create().validate(this);
  }

  // Getters
  public getTitulo(): string { return this.titulo; }
  public getSlug(): string { return this.slug; }
  public getDescricao(): string { return this.descricao; }
  public getConteudo(): string { return this.conteudo; }
  public getCategoria(): ArticleCategory { return this.categoria; }
  public getTags(): string[] { return this.tags; }
  public getStatus(): ArticleStatus { return this.status; }
  public getVisualizacoes(): number { return this.visualizacoes; }
  public getTempoLeituraMinutos(): number | undefined { return this.tempoLeituraMinutos; }
  public getAuthorId(): string { return this.authorId; }
  public getApprovedById(): string | undefined { return this.approvedById; }
  public getApprovedAt(): Date | undefined { return this.approvedAt; }
  public getRejectionReason(): string | undefined { return this.rejectionReason; }
  public getImages(): ArticleImageDto[] { return this.images; }
  public getDeletedAt(): Date | undefined { return this.deletedAt; }

  // Status helpers
  public isPending(): boolean { return this.status === ArticleStatus.PENDING; }
  public isApproved(): boolean { return this.status === ArticleStatus.APPROVED; }
  public isRejected(): boolean { return this.status === ArticleStatus.REJECTED; }
  public isArchived(): boolean { return this.status === ArticleStatus.ARCHIVED; }
  public isPublished(): boolean { return this.isApproved() && this.isActive && !this.deletedAt; }

  // Ownership helpers
  public isOwnedBy(userId: string): boolean { return this.authorId === userId; }
  public canBeEditedBy(userId: string): boolean {
    return this.isOwnedBy(userId) && (this.isPending() || this.isRejected());
  }
}
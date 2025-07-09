// src/domain/validators/article/article.zod.validator.ts
import { z } from "zod";
import { Validator } from "@/domain/shared/validators/validator";
import { Article } from "@/domain/entities/article/article.entity";
import { ZodUtils } from "@/shared/utils/zod-utils";
import { ValidatorDomainException } from "@/domain/shared/exceptions/validator-domain.exception";
import { DomainException } from "@/domain/shared/exceptions/domain.exception";
import { ArticleStatus, ArticleCategory, ImageType } from "generated/prisma";

export class ArticleZodValidator implements Validator<Article> {
  private constructor() {}

  public static create(): ArticleZodValidator {
    return new ArticleZodValidator();
  }

  public validate(input: Article): void {
    try {
      this.getZodSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = ZodUtils.formatZodError(error);
        throw new ValidatorDomainException(
          `Error validating Article ${input.getId()}: ${message}`,
          `Dados inválidos para artigo: ${message}`,
          ArticleZodValidator.name
        );
      }
      
      const err = error as Error;
      throw new DomainException(
        `Error validating Article ${input.getId()}: ${err.message}`,
        `Erro inesperado ao validar artigo: ${err.message}`,
        ArticleZodValidator.name
      );
    }
  }

  private getZodSchema() {
    // Schema para validar ArticleImage
    const articleImageSchema = z.object({
      id: z.string().uuid("ID da imagem inválido").optional(),
      filename: z.string().min(1, "Nome do arquivo é obrigatório"),
      type: z.nativeEnum(ImageType),
      size: z.number().positive("Tamanho deve ser positivo").optional(),
      width: z.number().positive("Largura deve ser positiva").optional(),
      height: z.number().positive("Altura deve ser positiva").optional(),
      base64: z.string().optional(),
      url: z.string().url("URL da imagem inválida").optional(),
      alt: z.string().optional(),
      metadata: z.any().optional(),
      order: z.number().int().min(0, "Ordem deve ser não negativa"),
      isMain: z.boolean(),
    });

    // Schema principal para Article
    const zodSchema = z.object({
      // Campos herdados da Entity
      id: z.string().uuid("ID do artigo inválido"),
      createdAt: z.date(),
      updatedAt: z.date(),
      isActive: z.boolean(),

      // Campos específicos do Article
      titulo: z.string()
        .min(5, "Título deve ter pelo menos 5 caracteres")
        .max(200, "Título não pode exceder 200 caracteres")
        .trim(),
      
      slug: z.string()
        .min(5, "Slug deve ter pelo menos 5 caracteres")
        .max(100, "Slug não pode exceder 100 caracteres")
        .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
      
      descricao: z.string()
        .min(20, "Descrição deve ter pelo menos 20 caracteres")
        .max(300, "Descrição não pode exceder 300 caracteres")
        .trim(),
      
      conteudo: z.string()
        .min(100, "Conteúdo deve ter pelo menos 100 caracteres")
        .max(50000, "Conteúdo não pode exceder 50.000 caracteres")
        .trim(),
      
      categoria: z.nativeEnum(ArticleCategory, {
        errorMap: () => ({ message: "Categoria de artigo inválida" })
      }),
      
      tags: z.array(z.string().trim().min(1, "Tag não pode estar vazia"))
        .min(1, "Pelo menos uma tag é obrigatória")
        .max(10, "Máximo de 10 tags permitidas")
        .refine(tags => {
          const uniqueTags = new Set(tags.map(tag => tag.toLowerCase()));
          return uniqueTags.size === tags.length;
        }, {
          message: "Tags não podem ser duplicadas"
        }),
      
      status: z.nativeEnum(ArticleStatus, {
        errorMap: () => ({ message: "Status do artigo inválido" })
      }),
      
      visualizacoes: z.number()
        .int()
        .min(0, "Visualizações devem ser não negativas"),
      
      tempoLeituraMinutos: z.number()
        .int()
        .min(1, "Tempo de leitura deve ser pelo menos 1 minuto")
        .max(120, "Tempo de leitura não pode exceder 120 minutos")
        .optional(),
      
      authorId: z.string()
        .uuid("ID do autor inválido"),
      
      // Campos de moderação
      approvedById: z.string()
        .uuid("ID do aprovador inválido")
        .optional(),
      
      approvedAt: z.date().optional(),
      
      rejectionReason: z.string()
        .max(500, "Motivo da rejeição não pode exceder 500 caracteres")
        .optional(),
      
      // Soft delete
      deletedAt: z.date().optional(),
      
      // Imagens do artigo
      images: z.array(articleImageSchema)
        .max(5, "Máximo de 5 imagens permitidas")
        .refine(images => {
          if (images.length === 0) return true; // Permite artigos sem imagens
          return images.some(image => image.isMain);
        }, {
          message: "Pelo menos uma imagem deve ser marcada como principal quando há imagens",
          path: ["images"]
        })
        .refine(images => {
          const mainImages = images.filter(image => image.isMain);
          return mainImages.length <= 1;
        }, {
          message: "Apenas uma imagem pode ser marcada como principal",
          path: ["images"]
        })
        .refine(images => {
          const orders = images.map(image => image.order);
          const uniqueOrders = new Set(orders);
          return orders.length === uniqueOrders.size;
        }, {
          message: "Cada imagem deve ter uma ordem única",
          path: ["images"]
        }),
    })
    // Validações condicionais
    .refine((data) => {
      if (data.status === ArticleStatus.APPROVED) {
        return data.approvedById && data.approvedAt;
      }
      return true;
    }, {
      message: "Artigos aprovados devem ter informações do aprovador",
      path: ["status"]
    })
    .refine((data) => {
      if (data.status === ArticleStatus.REJECTED) {
        return data.rejectionReason && data.rejectionReason.trim().length > 0;
      }
      return true;
    }, {
      message: "Artigos rejeitados devem ter um motivo de rejeição",
      path: ["rejectionReason"]
    })
    .refine((data) => {
      if (data.approvedAt && data.createdAt) {
        return data.approvedAt >= data.createdAt;
      }
      return true;
    }, {
      message: "Data de aprovação deve ser posterior à data de criação",
      path: ["approvedAt"]
    })
    .refine((data) => {
      if (data.deletedAt) {
        return !data.isActive;
      }
      return true;
    }, {
      message: "Artigos deletados não podem estar ativos",
      path: ["isActive"]
    })
    .refine((data) => {
      // Validar slug único seria feito no repository
      return data.slug.length > 0;
    }, {
      message: "Slug não pode estar vazio",
      path: ["slug"]
    });

    return zodSchema;
  }
}
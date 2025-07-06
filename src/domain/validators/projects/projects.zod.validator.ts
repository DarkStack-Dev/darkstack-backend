// src/domain/validators/projects/projects.zod.validator.ts - MELHORADO

import { z } from "zod";
import { Validator } from "../../shared/validators/validator";
import { ZodUtils } from "../../../shared/utils/zod-utils";
import { ValidatorDomainException } from "../../shared/exceptions/validator-domain.exception";
import { DomainException } from "../../shared/exceptions/domain.exception";
import { ImageType, ProjectStatus } from "generated/prisma";
import { Projects } from "@/domain/entities/projects/projects.entity";

export class ProjectsZodValidator implements Validator<Projects>{
  private constructor() {}

  public static create(): ProjectsZodValidator{
    return new ProjectsZodValidator();
  }

  public validate(input: Projects): void {
    try{
      this.getZodSchema().parse(input);
    }catch(error){
      if (error instanceof z.ZodError) {
        const message = ZodUtils.formatZodError(error);
        throw new ValidatorDomainException(
          `Error while validating Project ${input.getId()}: ${message}`,
          `Os dados informados não são válidos para o projeto ${input.getId()}: ${message}`,
          ProjectsZodValidator.name
        )
      }else{
        const err = error as Error;

        throw new DomainException(
          `Error while validating Project ${input.getId()}: ${err.message}`,
          `Erro inesperado para validar os dados do projeto ${input.getId()}: ${err.message}`,
          ProjectsZodValidator.name
        )
      }
    }
  }

  private getZodSchema() {
    // ✅ SIMPLIFICADO: Schema focado apenas nos dados essenciais da entidade
    // Removidas validações de relacionamentos complexos que são tratados pelos Use Cases
    
    // Schema para validar ProjectImage (simplificado)
    const projectImageSchema = z.object({
      id: z.string().cuid(),
      projectId: z.string().cuid(),
      filename: z.string().min(1, "Filename is required"),
      type: z.nativeEnum(ImageType),
      size: z.number().positive("Size must be positive").optional().nullable(),
      width: z.number().positive("Width must be positive").optional().nullable(),
      height: z.number().positive("Height must be positive").optional().nullable(),
      base64: z.string().optional().nullable(),
      url: z.string().url("Invalid image URL").optional().nullable(),
      metadata: z.any().optional().nullable(),
      order: z.number().int().min(0, "Order must be non-negative"),
      isMain: z.boolean(),
      createdAt: z.date(),
      updatedAt: z.date(),
    });

    // Schema para validar ProjectParticipant (simplificado)
    const projectParticipantSchema = z.object({
      id: z.string().cuid(),
      projectId: z.string().cuid(),
      userId: z.string().cuid(),
      addedById: z.string().cuid(),
      role: z.string().optional().nullable(),
      joinedAt: z.date(),
    });

    // Schema principal para Projects (focado na entidade, não nas relações)
    const zodSchema = z.object({
      // Campos herdados da Entity
      id: z.string().cuid("Invalid project ID format"),
      createdAt: z.date(),
      updatedAt: z.date(),
      isActive: z.boolean(),

      // Campos específicos do Projects
      name: z.string()
        .min(1, "Project name is required")
        .max(255, "Project name must not exceed 255 characters")
        .trim(),
      
      description: z.string()
        .min(1, "Project description is required")
        .max(5000, "Project description must not exceed 5000 characters")
        .trim(),
      
      status: z.nativeEnum(ProjectStatus, {
        errorMap: () => ({ message: "Invalid project status" })
      }),
      
      ownerId: z.string()
        .cuid("Invalid owner ID format"),
      
      // Campos opcionais de moderação
      approvedById: z.string()
        .cuid("Invalid approver ID format")
        .optional(),
      
      approvedAt: z.date().optional(),
      
      rejectionReason: z.string()
        .max(1000, "Rejection reason must not exceed 1000 characters")
        .optional(),
      
      // Soft delete
      deletedAt: z.date().optional(),
      
      // Arrays relacionados (validação básica)
      participants: z.array(projectParticipantSchema)
        .optional()
        .default([]),
      
      images: z.array(projectImageSchema)
        .min(1, "At least one image is required")
        .max(10, "Maximum of 10 images allowed"),
    })
    // ✅ MELHORADO: Validações condicionais mais robustas
    .refine((data) => {
      // Validação: se status é APPROVED, deve ter approvedBy e approvedAt
      if (data.status === ProjectStatus.APPROVED) {
        return data.approvedById && data.approvedAt;
      }
      return true;
    }, {
      message: "Approved projects must have approver information",
      path: ["status"]
    })
    .refine((data) => {
      // Validação: se status é REJECTED, deve ter rejectionReason
      if (data.status === ProjectStatus.REJECTED) {
        return data.rejectionReason && data.rejectionReason.trim().length > 0;
      }
      return true;
    }, {
      message: "Rejected projects must have a rejection reason",
      path: ["rejectionReason"]
    })
    .refine((data) => {
      // Validação: pelo menos uma imagem deve ser marcada como principal
      return data.images.some(image => image.isMain === true);
    }, {
      message: "At least one image must be marked as main",
      path: ["images"]
    })
    .refine((data) => {
      // Validação: não pode ter mais de uma imagem principal
      const mainImages = data.images.filter(image => image.isMain === true);
      return mainImages.length === 1;
    }, {
      message: "Only one image can be marked as main",
      path: ["images"]
    })
    .refine((data) => {
      // ✅ IMPLEMENTADO: Validação de data de aprovação deve ser após criação
      if (data.approvedAt && data.createdAt) {
        return data.approvedAt >= data.createdAt;
      }
      return true;
    }, {
      message: "Approval date must be after creation date",
      path: ["approvedAt"]
    })
    .refine((data) => {
      // ✅ IMPLEMENTADO: Projeto deletado não pode estar ativo
      if (data.deletedAt) {
        return !data.isActive;
      }
      return true;
    }, {
      message: "Deleted projects cannot be active",
      path: ["isActive"]
    });

    return zodSchema;
  }
}
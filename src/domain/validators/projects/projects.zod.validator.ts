// src/domain/validators/projects/projects.zod.validator.ts - CORRIGIDO para UUID

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
    // ✅ CORRIGIDO: Schema para validar ProjectImage usando UUID
    const projectImageSchema = z.object({
      id: z.string().uuid("Invalid image ID format"), // ✅ Mudou de .cuid() para .uuid()
      projectId: z.string().uuid("Invalid project ID format"), // ✅ Mudou de .cuid() para .uuid()
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

    // ✅ CORRIGIDO: Schema para validar ProjectParticipant usando UUID
    const projectParticipantSchema = z.object({
      id: z.string().uuid("Invalid participant ID format"), // ✅ Mudou de .cuid() para .uuid()
      projectId: z.string().uuid("Invalid project ID format"), // ✅ Mudou de .cuid() para .uuid()
      userId: z.string().uuid("Invalid user ID format"), // ✅ Mudou de .cuid() para .uuid()
      addedById: z.string().uuid("Invalid adder ID format"), // ✅ Mudou de .cuid() para .uuid()
      role: z.string().optional().nullable(),
      joinedAt: z.date(),
    });

    // ✅ CORRIGIDO: Schema principal para Projects usando UUID
    const zodSchema = z.object({
      // Campos herdados da Entity
      id: z.string().uuid("Invalid project ID format"), // ✅ Mudou de .cuid() para .uuid()
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
        .uuid("Invalid owner ID format"), // ✅ Mudou de .cuid() para .uuid()
      
      // Campos opcionais de moderação
      approvedById: z.string()
        .uuid("Invalid approver ID format") // ✅ Mudou de .cuid() para .uuid()
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
    // Validações condicionais (mantidas iguais)
    .refine((data) => {
      if (data.status === ProjectStatus.APPROVED) {
        return data.approvedById && data.approvedAt;
      }
      return true;
    }, {
      message: "Approved projects must have approver information",
      path: ["status"]
    })
    .refine((data) => {
      if (data.status === ProjectStatus.REJECTED) {
        return data.rejectionReason && data.rejectionReason.trim().length > 0;
      }
      return true;
    }, {
      message: "Rejected projects must have a rejection reason",
      path: ["rejectionReason"]
    })
    .refine((data) => {
      return data.images.some(image => image.isMain === true);
    }, {
      message: "At least one image must be marked as main",
      path: ["images"]
    })
    .refine((data) => {
      const mainImages = data.images.filter(image => image.isMain === true);
      return mainImages.length === 1;
    }, {
      message: "Only one image can be marked as main",
      path: ["images"]
    })
    .refine((data) => {
      if (data.approvedAt && data.createdAt) {
        return data.approvedAt >= data.createdAt;
      }
      return true;
    }, {
      message: "Approval date must be after creation date",
      path: ["approvedAt"]
    })
    .refine((data) => {
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
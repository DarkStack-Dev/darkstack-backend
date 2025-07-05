import { z } from "zod";
import { User } from "../../entities/user/user.entitty";
import { Validator } from "../../shared/validators/validator";
import { ZodUtils } from "../../../shared/utils/zod-utils";
import { ValidatorDomainException } from "../../shared/exceptions/validator-domain.exception";
import { DomainException } from "../../shared/exceptions/domain.exception";
import { ImageType, ProjectStatus, UserRole } from "generated/prisma";
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
    // Schema para validar User
    const userSchema = z.object({
      id: z.string().cuid(),
      name: z.string().min(1, "User name is required"),
      email: z.string().email("Invalid email format"),
      avatar: z.string().url("Invalid avatar URL").optional().nullable(),
      createdAt: z.date(),
      updatedAt: z.date(),
      roles: z.array(z.nativeEnum(UserRole)).min(1, "User must have at least one role"),
      isActive: z.boolean(),
      emailVerified: z.boolean(),
    });

    // Schema para validar ProjectImage
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
      metadata: z.any().optional().nullable(), // JSON pode ser qualquer coisa
      order: z.number().int().min(0, "Order must be non-negative"),
      isMain: z.boolean(),
      createdAt: z.date(),
      updatedAt: z.date(),
    });

    // Schema para validar ProjectParticipant
    const projectParticipantSchema = z.object({
      id: z.string().cuid(),
      projectId: z.string().cuid(),
      userId: z.string().cuid(),
      addedById: z.string().cuid(),
      role: z.string().optional().nullable(),
      joinedAt: z.date(),
    });

    // Schema principal para Projects
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
      
      owner: userSchema,
      
      // Campos opcionais de moderação
      approvedByIds: z.string()
        .cuid("Invalid approver ID format")
        .optional(),
      
      approvedBy: userSchema.optional(),
      
      approvedAt: z.date().optional(),
      
      rejectionReason: z.string()
        .max(1000, "Rejection reason must not exceed 1000 characters")
        .optional(),
      
      // Arrays relacionados
      participants: z.array(projectParticipantSchema)
        .optional()
        .default([]),
      
      images: z.array(projectImageSchema)
        .min(1, "At least one image is required")
        .max(10, "Maximum of 10 images allowed"),
    })
    .refine((data) => {
      // Validação customizada: se status é APPROVED, deve ter approvedBy e approvedAt
      if (data.status === ProjectStatus.APPROVED) {
        return data.approvedBy && data.approvedAt && data.approvedByIds;
      }
      return true;
    }, {
      message: "Approved projects must have approver information",
      path: ["status"]
    })
    .refine((data) => {
      // Validação customizada: se status é REJECTED, deve ter rejectionReason
      if (data.status === ProjectStatus.REJECTED) {
        return data.rejectionReason && data.rejectionReason.trim().length > 0;
      }
      return true;
    }, {
      message: "Rejected projects must have a rejection reason",
      path: ["rejectionReason"]
    })
    .refine((data) => {
      // Validação customizada: pelo menos uma imagem deve ser marcada como principal
      return data.images.some(image => image.isMain === true);
    }, {
      message: "At least one image must be marked as main",
      path: ["images"]
    })
    .refine((data) => {
      // Validação customizada: não pode ter mais de uma imagem principal
      const mainImages = data.images.filter(image => image.isMain === true);
      return mainImages.length === 1;
    }, {
      message: "Only one image can be marked as main",
      path: ["images"]
    })
    .refine((data) => {
      // Validação customizada: owner não pode estar nos participants
      if (data.participants && data.participants.length > 0) {
        return !data.participants.some(participant => participant.userId === data.ownerId);
      }
      return true;
    }, {
      message: "Project owner cannot be a participant",
      path: ["participants"]
    });

    return zodSchema;
  }
}
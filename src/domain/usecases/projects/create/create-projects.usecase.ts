import { UseCase } from "../../usecase";
import { Injectable } from "@nestjs/common";
import { ProjectsGatewayRepository } from "@/domain/repositories/projects/projects.gateway.repository";
import { UserGatewayRepository } from "@/domain/repositories/user/user.gateway.repository";
import { UserNotFoundUsecaseException } from "@/usecases/exceptions/user/user-not-found.usecase.exception";
import { Projects } from "@/domain/entities/projects/projects.entity";
import { ProjectsAumontLimitReachedUsecaseException } from "@/usecases/exceptions/projects/projects-aumont-limit-reached.usecase.exceptions";
import { ProjectStatus, ProjectImage, ImageType } from "generated/prisma";
import { Utils } from "@/shared/utils/utils";
import { InvalidInputUsecaseException } from "@/domain/usecases/exceptions/input/invalid-input.usecase.exception";

export type ProjectImageInput = {
  filename: string;
  type: ImageType;
  size?: number;
  width?: number;
  height?: number;
  base64?: string;
  url?: string;
  metadata?: any;
  isMain?: boolean;
};

export type CreateProjectInput = {
  name: string;
  description: string;
  images: ProjectImageInput[];
  userId: string;
};

export type CreateProjectOutput = {
  id: string;
  name: string;
  status: ProjectStatus;
  createdAt: Date;
};

@Injectable()
export class CreateProjectsUseCase implements UseCase<CreateProjectInput, CreateProjectOutput> {
  private static readonly MAX_PROJECTS_PER_USER = 5;
  private static readonly MIN_IMAGES_REQUIRED = 1;
  private static readonly MAX_IMAGES_ALLOWED = 5; // CORRIGIDO: 5 em vez de 10

  public constructor(
    private readonly projectsGatewayRepository: ProjectsGatewayRepository,
    private readonly userGatewayRepository: UserGatewayRepository
  ) {}

  public async execute({
    name,
    description,
    images,
    userId
  }: CreateProjectInput): Promise<CreateProjectOutput> {
    // Validações de entrada
    this.validateInput({ name, description, images, userId });

    // Buscar e validar usuário
    const user = await this.userGatewayRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundUsecaseException(
        `User not found with id ${userId} in ${CreateProjectsUseCase.name}.`,
        "Usuário não encontrado.",
        CreateProjectsUseCase.name,
      );
    }

    // Verificar limite de projetos por usuário
    await this.validateProjectLimit(userId);

    // ✅ CORRIGIDO: Gerar ID do projeto antecipadamente
    const projectId = Utils.GenerateUUID();

    // Processar e validar imagens com o projectId correto
    const processedImages = this.processProjectImages(images, projectId);

    // Criar o projeto com o ID pré-gerado
    const project = Projects.create({
      id: projectId, // ✅ CORRIGIDO: Passar o ID gerado
      name: name.trim(),
      description: description.trim(),
      status: ProjectStatus.PENDING,
      ownerId: userId,
      images: processedImages,
      // Campos opcionais para criação
      approvedById: undefined,
      approvedAt: undefined,
      rejectionReason: undefined,
      participants: [],
    });

    // Persistir o projeto
    await this.projectsGatewayRepository.create(project);

    // Retornar output
    return {
      id: project.getId(),
      name: project.getName(),
      status: project.getStatus(),
      createdAt: project.getCreatedAt(),
    };
  }

  private validateInput({ name, description, images, userId }: CreateProjectInput): void {
    if (!name || name.trim().length === 0) {
      throw new InvalidInputUsecaseException(
        "Project name is required",
        "Nome do projeto é obrigatório.",
        CreateProjectsUseCase.name
      );
    }

    if (name.trim().length > 255) {
      throw new InvalidInputUsecaseException(
        "Project name must not exceed 255 characters",
        "Nome do projeto não pode exceder 255 caracteres.",
        CreateProjectsUseCase.name
      );
    }

    if (!description || description.trim().length === 0) {
      throw new InvalidInputUsecaseException(
        "Project description is required",
        "Descrição do projeto é obrigatória.",
        CreateProjectsUseCase.name
      );
    }

    if (description.trim().length > 5000) {
      throw new InvalidInputUsecaseException(
        "Project description must not exceed 5000 characters",
        "Descrição do projeto não pode exceder 5000 caracteres.",
        CreateProjectsUseCase.name
      );
    }

    if (!userId || userId.trim().length === 0) {
      throw new InvalidInputUsecaseException(
        "User ID is required",
        "ID do usuário é obrigatório.",
        CreateProjectsUseCase.name
      );
    }

    if (!images || images.length < CreateProjectsUseCase.MIN_IMAGES_REQUIRED) {
      throw new InvalidInputUsecaseException(
        `At least ${CreateProjectsUseCase.MIN_IMAGES_REQUIRED} image is required`,
        `Pelo menos ${CreateProjectsUseCase.MIN_IMAGES_REQUIRED} imagem é obrigatória.`,
        CreateProjectsUseCase.name
      );
    }

    if (images.length > CreateProjectsUseCase.MAX_IMAGES_ALLOWED) {
      throw new InvalidInputUsecaseException(
        `Maximum of ${CreateProjectsUseCase.MAX_IMAGES_ALLOWED} images allowed`,
        `Máximo de ${CreateProjectsUseCase.MAX_IMAGES_ALLOWED} imagens permitidas.`,
        CreateProjectsUseCase.name
      );
    }
  }

  private async validateProjectLimit(userId: string): Promise<void> {
    const currentProjectsCount = await this.projectsGatewayRepository.amountProjectsByUserId(userId);

    if (currentProjectsCount >= CreateProjectsUseCase.MAX_PROJECTS_PER_USER) {
      throw new ProjectsAumontLimitReachedUsecaseException(
        `User with id ${userId} already has ${CreateProjectsUseCase.MAX_PROJECTS_PER_USER} projects in ${CreateProjectsUseCase.name}.`,
        `Você já possui ${CreateProjectsUseCase.MAX_PROJECTS_PER_USER} projetos cadastrados.`,
        CreateProjectsUseCase.name,
      );
    }
  }

  // ✅ CORRIGIDO: Receber projectId como parâmetro
  private processProjectImages(imagesInput: ProjectImageInput[], projectId: string): ProjectImage[] {
    const hasMainImage = imagesInput.some(img => img.isMain === true);
    
    return imagesInput.map((imageInput, index) => {
      // Se nenhuma imagem foi marcada como principal, a primeira será a principal
      const isMain = hasMainImage ? (imageInput.isMain || false) : index === 0;

      // Validar que cada imagem tem pelo menos filename e type
      if (!imageInput.filename || !imageInput.type) {
        throw new InvalidInputUsecaseException(
          "Each image must have filename and type",
          "Cada imagem deve ter nome do arquivo e tipo.",
          CreateProjectsUseCase.name
        );
      }

      // Validar que tem pelo menos base64 ou url
      if (!imageInput.base64 && !imageInput.url) {
        throw new InvalidInputUsecaseException(
          "Each image must have either base64 or url",
          "Cada imagem deve ter base64 ou URL.",
          CreateProjectsUseCase.name
        );
      }

      const projectImage: ProjectImage = {
        id: Utils.GenerateUUID(),
        projectId: projectId, // ✅ CORRIGIDO: Usar o projectId correto
        filename: imageInput.filename,
        type: imageInput.type,
        size: imageInput.size || null,
        width: imageInput.width || null,
        height: imageInput.height || null,
        base64: imageInput.base64 || null,
        url: imageInput.url || null,
        metadata: imageInput.metadata || null,
        order: index,
        isMain,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return projectImage;
    });
  }
}
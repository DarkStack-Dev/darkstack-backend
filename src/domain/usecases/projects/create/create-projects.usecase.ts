// src/domain/usecases/projects/create/create-projects.usecase.ts - ATUALIZADO COM NOTIFICAÇÕES

import { UseCase } from "../../usecase";
import { Injectable } from "@nestjs/common";
import { ProjectsGatewayRepository } from "@/domain/repositories/projects/projects.gateway.repository";
import { UserGatewayRepository } from "@/domain/repositories/user/user.gateway.repository";
import { NotificationGatewayRepository } from "@/domain/repositories/notification/notification.gateway.repository";
import { UserNotFoundUsecaseException } from "@/usecases/exceptions/user/user-not-found.usecase.exception";
import { Projects } from "@/domain/entities/projects/projects.entity";
import { Notification } from "@/domain/entities/notification/notification.entity";
import { ProjectsAumontLimitReachedUsecaseException } from "@/usecases/exceptions/projects/projects-aumont-limit-reached.usecase.exceptions";
import { ProjectStatus, ProjectImage, ImageType, UserRole } from "generated/prisma";
import { Utils } from "@/shared/utils/utils";
import { InvalidInputUsecaseException } from "@/domain/usecases/exceptions/input/invalid-input.usecase.exception";
import { NotificationGateway } from "@/infra/websocket/notification.gateway";

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
  private static readonly MAX_IMAGES_ALLOWED = 5;

  public constructor(
    private readonly projectsGatewayRepository: ProjectsGatewayRepository,
    private readonly userGatewayRepository: UserGatewayRepository,
    private readonly notificationGatewayRepository: NotificationGatewayRepository, // ✅ NOVO
    private readonly notificationGateway: NotificationGateway, // ✅ NOVO: WebSocket
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

    // Gerar ID do projeto antecipadamente
    const projectId = Utils.GenerateUUID();

    // Processar e validar imagens com o projectId correto
    const processedImages = this.processProjectImages(images, projectId);

    // Criar o projeto com o ID pré-gerado
    const project = Projects.create({
      id: projectId,
      name: name.trim(),
      description: description.trim(),
      status: ProjectStatus.PENDING,
      ownerId: userId,
      images: processedImages,
      approvedById: undefined,
      approvedAt: undefined,
      rejectionReason: undefined,
      participants: [],
    });

    // Persistir o projeto
    await this.projectsGatewayRepository.create(project);

    console.log(`✅ Projeto "${project.getName()}" criado com sucesso por ${user.getName()}`);

    // ✅ NOVO: SISTEMA DE NOTIFICAÇÃO PARA MODERADORES
    try {
      await this.notifyModerators(project, user.getName());
      console.log(`📢 Moderadores notificados sobre novo projeto: ${project.getName()}`);
    } catch (notificationError) {
      // Log do erro mas não falha a criação do projeto
      console.error(`⚠️ Erro ao notificar moderadores sobre projeto ${project.getId()}:`, notificationError);
    }

    // Retornar output
    return {
      id: project.getId(),
      name: project.getName(),
      status: project.getStatus(),
      createdAt: project.getCreatedAt(),
    };
  }

  // ✅ NOVO: Método para notificar moderadores
  private async notifyModerators(project: Projects, authorName: string): Promise<void> {
    try {
      // 1. Buscar todos os moderadores e admins
      const [moderators, admins] = await Promise.all([
        this.userGatewayRepository.findByRole(UserRole.MODERATOR),
        this.userGatewayRepository.findByRole(UserRole.ADMIN),
      ]);

      // Combinar moderadores e admins, removendo duplicatas
      const allModerators = [...moderators, ...admins];
      const uniqueModeratorIds = [...new Set(allModerators.map(mod => mod.getId()))];

      if (uniqueModeratorIds.length === 0) {
        console.log(`⚠️ Nenhum moderador encontrado para notificar sobre projeto ${project.getName()}`);
        return;
      }

      // 2. Criar notificações usando factory method
      const notifications = Notification.createProjectPending(
        project.getId(),
        project.getName(),
        uniqueModeratorIds
      );

      // 3. Persistir notificações no banco
      await this.notificationGatewayRepository.createMany(notifications);

      // 4. Enviar via WebSocket para moderadores online
      const notificationData = {
        id: notifications[0].getId(), // ID da primeira notificação (são iguais exceto o destinatário)
        type: 'PROJECT_PENDING',
        title: 'Novo projeto aguardando moderação',
        message: `O projeto "${project.getName()}" foi enviado por ${authorName} e aguarda aprovação.`,
        projectId: project.getId(),
        projectName: project.getName(),
        authorName,
        createdAt: new Date(),
        metadata: {
          action: 'moderate',
          url: `/admin/projects/${project.getId()}`,
          projectStatus: project.getStatus(),
        },
      };

      // Enviar para todos os moderadores conectados
      const moderatorsNotified = this.notificationGateway.sendNotificationToModerators(notificationData);

      console.log(`📢 Notificação enviada para ${notifications.length} moderadores (${moderatorsNotified} online via WebSocket)`);

    } catch (error) {
      console.error(`❌ Erro no sistema de notificação de moderadores:`, error);
      throw error; // Re-lançar para o método principal decidir como tratar
    }
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
        projectId: projectId,
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
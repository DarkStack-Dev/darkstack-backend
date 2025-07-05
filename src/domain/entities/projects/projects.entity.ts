import { ProjectsValidatorFactory } from "@/domain/factories/projects/projects.validator.factory";
import { Entity } from "@/domain/shared/entities/entity";
import { Utils } from "@/shared/utils/utils";
import { ProjectImage, ProjectParticipant, ProjectStatus, User } from "generated/prisma";

export type ProjectsCreateDto = {
  name: string;
  description: string;
  status: ProjectStatus;
  ownerId: string; // Apenas ID, não objeto completo
  approvedById?: string; // CORRIGIDO: singular para consistir com Prisma
  approvedAt?: Date;
  rejectionReason?: string;
  participants?: ProjectParticipant[];
  images: ProjectImage[];
}

export type ProjectsWithDto = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  ownerId: string;
  approvedById?: string; // CORRIGIDO: singular
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date; // ADICIONADO: para consistir com Prisma
  isActive: boolean;
  participants?: ProjectParticipant[];
  images: ProjectImage[];
};

export class Projects extends Entity{
  private name: string;
  private description: string;
  private status: ProjectStatus;
  private ownerId: string; // Apenas ID
  private approvedById?: string; // CORRIGIDO: singular
  private approvedAt?: Date;
  private rejectionReason?: string;
  private participants?: ProjectParticipant[];
  private images: ProjectImage[];
  private deletedAt?: Date; // ADICIONADO

  protected constructor(
  id: string,
  name: string,
  description: string,
  status: ProjectStatus,
  ownerId: string,
  images: ProjectImage[],
  createdAt: Date,
  updatedAt: Date,
  isActive: boolean = true,
  approvedById?: string, // CORRIGIDO
  approvedAt?: Date,
  rejectionReason?: string,
  participants?: ProjectParticipant[],
  deletedAt?: Date // ADICIONADO
  
) {
    super(id, createdAt, updatedAt, isActive);
    this.name = name;
    this.description = description;
    this.status = status;
    this.ownerId = ownerId;
    this.approvedById = approvedById;
    this.approvedAt = approvedAt;
    this.rejectionReason = rejectionReason;
    this.participants = participants;
    this.images = images;
    this.deletedAt = deletedAt;
    this.validate();
  }

  public static create({
    name, 
    description, 
    status, 
    ownerId, 
    approvedById, 
    approvedAt, 
    rejectionReason, 
    participants, 
    images
  }: ProjectsCreateDto): Projects {
    const id = Utils.GenerateUUID();
    const isActive = true;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    return new Projects(
      id, name, description, status, ownerId, images, 
      createdAt, updatedAt, isActive, approvedById, 
      approvedAt, rejectionReason, participants
    );
  }

  public static with({
      id,
      name,
      description,
      status,
      ownerId,
      approvedById,
      approvedAt,
      rejectionReason,
      participants,
      images,
      createdAt,
      updatedAt,
      isActive
  }: ProjectsWithDto): Projects {
      return new Projects(id, name, description, status, ownerId, images, createdAt, updatedAt, isActive, approvedById, approvedAt, rejectionReason, participants);
  }

  protected validate(): void {
    ProjectsValidatorFactory.create().validate(this);
  }
     
  public getName(): string{
    return this.name;
  }

  public getDescription(): string{
    return this.description;
  }

  public getStatus(): ProjectStatus{
    return this.status;
  }

  public getOwnerId(): string{
    return this.ownerId;
  }

  public getApprovedById(): string | undefined {
    return this.approvedById;
  }

  public getDeletedAt(): Date | undefined {
    return this.deletedAt;
  }

  // Método para soft delete
  public softDelete(): void {
    this.deletedAt = new Date();
    this.isActive = false;
  }

  public getApprovedAt(): Date | undefined {
    return this.approvedAt;
  }

  public getRejectionReason(): string | undefined {
    return this.rejectionReason;
  }

  public getParticipants(): ProjectParticipant[] | undefined {
    return this.participants;
  }

  public getImages(): ProjectImage[] {
    return this.images;
  }

  public getImagesPath(): ProjectImage[]{
    return this.images;
  }
}
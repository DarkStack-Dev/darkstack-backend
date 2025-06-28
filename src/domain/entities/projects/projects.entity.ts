import { ProjectsValidatorFactory } from "@/domain/factories/projects/projects.validator.factory";
import { Entity } from "@/domain/shared/entities/entity";
import { Utils } from "@/shared/utils/utils";
import { User } from "generated/prisma";



export type ProjectsCreateDto = {
  name: string;
  description : string;
  imagesPath: string[];
  user_id: string;
}

export type ProjectsWithDto = {
  id: string;
  name: string;
  description: string;
  imagesPath: string[];
  user_id: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
};

export class Projects extends Entity{
  private name: string;
  private description: string;
  private imagesPath: string[];
  user_id: string;

  protected constructor(
  id: string,
  name: string,
  description: string,
  imagesPath: string[],
  user_id: string,
  createdAt: Date, 
  updatedAt: Date, 
  isActive: boolean) {
    super(id, createdAt, updatedAt, isActive);
    this.name = name;
    this.description = description;
    this.imagesPath = imagesPath;
    this.user_id = user_id;
    this.validate();
  }

  public static create({name, description, imagesPath, user_id}: ProjectsCreateDto): Projects {
      const id = Utils.GenerateUUID();
      const isActive = true;
  
      const createdAt = new Date();
      const updatedAt = new Date();
      return new Projects(id, name, description, imagesPath, user_id, createdAt, updatedAt, isActive);
  }

  public static with({
      id,
      name,
      description,
      imagesPath,
      user_id,
      createdAt,
      updatedAt,
      isActive = true
  }: ProjectsWithDto): Projects {
      return new Projects(id, name, description,  imagesPath, user_id, createdAt, updatedAt, isActive);
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

  public getImagesPath(): string[]{
    return this.imagesPath;
  }
}
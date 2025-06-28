import { UseCase } from "../../usecase";
import { EmailAlreadyExistsUsecaseException } from "../../exceptions/email/email-already-exists.usecase.exception";
import { User } from "@/domain/entities/user/user.entitty";
import { Injectable } from "@nestjs/common";
import { ProjectsGatewayRepository } from "@/domain/repositories/projects/projects.gateway.repository";
import { UserGatewayRepository } from "@/domain/repositories/user/user.gateway.repository";
import { UserNotFoundUsecaseException } from "@/usecases/exceptions/user/user-not-found.usecase.exception";
import { Projects } from "@/domain/entities/projects/projects.entity";
import { ProjectsAumontLimitReachedUsecaseException } from "@/usecases/exceptions/projects/projects-aumont-limit-reached.usecase.exceptions";

export type ProjectsUserInput = {
  name: string;
  description : string;
  imagesPath: string[];
  user_id: string;
}

export type ProjectsUserOutput = {
  id: string;
}

@Injectable()
export class CreateProjectsUseCase implements UseCase<ProjectsUserInput, ProjectsUserOutput> {
  public constructor(
    private readonly projectsGatewayRepository: ProjectsGatewayRepository,
    private readonly userGatewayRepository: UserGatewayRepository
  ) {}

  public async execute({name, description, imagesPath, user_id}: ProjectsUserInput): Promise<ProjectsUserOutput>{
    const user = await this.userGatewayRepository.findById(user_id);
    if (!user) {
      throw new UserNotFoundUsecaseException(
        `User not found with id ${user_id} in ${CreateProjectsUseCase.name}.`,
        "Usuário não encontrado.",
        CreateProjectsUseCase.name,
      )
    }

    const aumontProjects = await this.projectsGatewayRepository.amountProjectsByUserId(user.getId());

    if (aumontProjects >= 5) {
      throw new ProjectsAumontLimitReachedUsecaseException(
        `User with id ${user_id} already has 5 projects in ${CreateProjectsUseCase.name}.`,
        `Você já possui 5 projetos cadastrados.`,
        CreateProjectsUseCase.name,
      );
    }

    const anProjects = Projects.create({name, description, imagesPath, user_id});

    await this.projectsGatewayRepository.create(anProjects);

    const output: ProjectsUserOutput = {
      id: anProjects.getId(),
    };

    return output;
  }
}
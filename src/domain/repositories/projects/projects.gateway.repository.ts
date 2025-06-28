import { Projects } from "@/domain/entities/projects/projects.entity";

export abstract class ProjectsGatewayRepository {
  abstract findById(id: string): Promise<Projects | null>;
  abstract create(project: Projects): Promise<void>;
  abstract amountProjectsByUserId(userId: string): Promise<number>;
}
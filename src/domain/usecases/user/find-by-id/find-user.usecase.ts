import { UserGatewayRepository } from "src/domain/repositories/user/user.gateway.repository";
import { UserNotFoundUsecaseException } from "../../exceptions/user/user-not-found.usecase.exception";
import { Injectable } from "@nestjs/common";
import { UserRole } from "generated/prisma";

export type FindUserInput = {
  id: string;
}

export type FindUserOutput = {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  updatedAt: Date;
  createdAt: Date;
}

@Injectable()
export class FindUserUseCase {
  public constructor(private readonly userGateway: UserGatewayRepository){
    
  }

  public async execute({id}: FindUserInput): Promise<FindUserOutput> {
    const user = await this.userGateway.findById(id);
    if (!user) {
      throw new UserNotFoundUsecaseException(
        `User not found with id ${id} in ${FindUserUseCase.name}.`,
        "Usuário não encontrado.",
        FindUserUseCase.name,
      )
    }

    const output: FindUserOutput = {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail(),
      roles: user.getRoles(),
      updatedAt: user.getUpdatedAt(),
      createdAt: user.getCreatedAt(),
    };

    return output;
  }
}
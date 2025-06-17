import { UserGatewayRepository } from "src/domain/repositories/user/user.gateway.repository";
import { UseCase } from "../../usecase";
import { EmailAlreadyExistsUsecaseException } from "../../exceptions/email/email-already-exists.usecase.exception";
import { User } from "src/domain/entities/user.entitty";
import { Injectable } from "@nestjs/common";
import { UserRole } from "generated/prisma";

export type CreateUserInput = {
  email: string;
  password: string;
  name: string;
  roles: UserRole[];
}

export type CreateUserOutput = {
  id: string;
}

@Injectable()
export class CreateUserUseCase implements UseCase<CreateUserInput, CreateUserOutput> {
  public constructor(private readonly userGatewayRepository: UserGatewayRepository) {}

  public async execute({email, password, name, roles}: CreateUserInput): Promise<CreateUserOutput>{
    const existentUser = await this.userGatewayRepository.findByEmail(email);
    if (existentUser) {
      throw new EmailAlreadyExistsUsecaseException(
        `Email already exists while creating user with email ${email} in ${CreateUserUseCase.name}.`,
        "O -email já está sendo utilizado.",
        CreateUserUseCase.name,
      )
    }

    const anUser = User.create({name, email, password, roles});

    await this.userGatewayRepository.create(anUser);

    const output: CreateUserOutput = {
      id: anUser.getId(),
    };

    return output;
  }
}
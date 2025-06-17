import { Injectable } from '@nestjs/common';
import { UserRole } from 'generated/prisma';
import { User } from 'src/domain/entities/user.entitty';
import { UserGatewayRepository } from 'src/domain/repositories/user/user.gateway.repository';
import { EmailAlreadyExistsUsecaseException } from 'src/usecases/exceptions/email-already-exists.usecase.exception';
import { Usecase } from 'src/usecases/usecase';

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  roles: UserRole[];
};

export type CreateUserOutput = {
  id: string;
};

@Injectable()
export class CreateUserUsecase
  implements Usecase<CreateUserInput, CreateUserOutput>
{
  public constructor(private readonly userGateway: UserGatewayRepository) {}

  public async execute({
    name,
    email,
    password,
    roles,
  }: CreateUserInput): Promise<CreateUserOutput> {
    const existentUser = await this.userGateway.findByEmail(email);

    if (existentUser) {
      throw new EmailAlreadyExistsUsecaseException(
        `Email already exists while creating user with email ${email} in ${CreateUserUsecase.name}`,
        `O e-mail já está sendo utilizado`,
        CreateUserUsecase.name,
      );
    }

    const anUser = User.create({name, email, password, roles });

    await this.userGateway.create(anUser);

    const output: CreateUserOutput = {
      id: anUser.getId(),
    };

    return output;
  }
}
import { UserGatewayRepository } from "src/domain/repositories/user/user.gateway.repository";
import { JwtService } from "src/infra/services/jwt/jwt.service";
import { UseCase } from "../../usecase";
import { UserNotFoundUsecaseException } from "../../exceptions/user/user-not-found.usecase.exception";
import { CredentialsNotValidUsecaseException } from "../../exceptions/user/credentials-not-valid.usecase.exception";
import { Injectable } from "@nestjs/common";

export type LoginUserInput = {
  email: string;
  password: string;
}

export type LoginUserOutput = {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class SigninUserUseCase implements UseCase<LoginUserInput, LoginUserOutput> {
  
  public constructor(
    private readonly userGatewayRepository: UserGatewayRepository,
    private readonly jwtService: JwtService
  ) {
    
  }

  public async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const anUser = await this.userGatewayRepository.findByEmail(input.email);
    if (!anUser) {
      throw new CredentialsNotValidUsecaseException(
        `User not found with email ${input.email} in ${SigninUserUseCase.name}.`,
        "Credenciais inválidas.",
        SigninUserUseCase.name,
      )
    }

    const isValidPassword = anUser.comparePassword(input.password);

    if(!isValidPassword) {
      throw new CredentialsNotValidUsecaseException(
        `Invalid password for user with email ${input.email} and id ${anUser.getId()} in ${SigninUserUseCase.name}.`,
        "Credenciais inválidas.",
        SigninUserUseCase.name,
      );
    }

    const accessToken =  this.jwtService.generateAuthToken(anUser.getId());
    const refreshToken =  this.jwtService.generateRefreshToken(anUser.getId());

    const output: LoginUserOutput = {
      accessToken,
      refreshToken,
    };

    return output;
  }
}
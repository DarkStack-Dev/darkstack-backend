import { Injectable } from "@nestjs/common";
import { UseCase } from "../../usecase";
import { UserGatewayRepository } from "src/domain/repositories/user/user.gateway.repository";
import { JwtService } from "src/infra/services/jwt/jwt.service";
import { CredentialsNotValidUsecaseException } from "../../exceptions/user/credentials-not-valid.usecase.exception";


export type RefreshAuthTokenUserUsecaseInput = {
  refreshToken: string;
};

export type RefreshAuthTokenUserUsecaseOutput = {
  authToken: string;
};

@Injectable()
export class RefreshAuthTokenUserUsecase
  implements
    UseCase<RefreshAuthTokenUserUsecaseInput, RefreshAuthTokenUserUsecaseOutput>
{
  public constructor(
    private readonly userGateway: UserGatewayRepository,
    private readonly jwtService: JwtService,
  ) {}

  public async execute({
    refreshToken,
  }: RefreshAuthTokenUserUsecaseInput): Promise<RefreshAuthTokenUserUsecaseOutput> {
    const { authToken, userId } = this.jwtService.generateAuthTokenWithRefreshToken(refreshToken);

    const anUser = await this.userGateway.findById(userId);

    if (!anUser) {
      throw new CredentialsNotValidUsecaseException(
        `User with id ${userId} not found while refreshing auth token with refresh token ${refreshToken} in ${RefreshAuthTokenUserUsecase.name}`,
        `Credenciais inválidas`,
        RefreshAuthTokenUserUsecase.name,
      );
    }

    const output: RefreshAuthTokenUserUsecaseOutput = {
      authToken,
    };

    return output;
  }
}
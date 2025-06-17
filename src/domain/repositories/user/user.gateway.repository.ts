import { User } from "src/domain/entities/user.entitty";

export abstract class UserGatewayRepository {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract create(user: User): Promise<void>;
}
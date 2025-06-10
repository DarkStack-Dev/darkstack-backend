import { User } from "src/domain/entities/user.entitty";

export interface UserGatewayRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: User): Promise<void>;
}
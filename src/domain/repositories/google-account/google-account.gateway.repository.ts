// src/domain/repositories/google-account/google-account.gateway.repository.ts

import { GoogleAccount } from "@/domain/entities/google-account/google-account.entity";

export abstract class GoogleAccountGatewayRepository {
  abstract findByGoogleId(googleId: string): Promise<GoogleAccount | null>;
  abstract findByUserId(userId: string): Promise<GoogleAccount | null>;
  abstract create(googleAccount: GoogleAccount): Promise<void>;
  abstract update(googleAccount: GoogleAccount): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
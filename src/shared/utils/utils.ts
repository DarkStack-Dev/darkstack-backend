import { compareSync, genSaltSync, hashSync } from "bcryptjs";
import * as crypto from 'crypto';

export class Utils{
  public static GenerateUUID(): string {
    return crypto.randomUUID();
  }

  public static encryptPassword(password: string): string {
    const salt = this.generateSalt();
    const hashedPassword = hashSync(password, salt);
    return hashedPassword;
  }

  public static comparePassword(password: string, hashedPassword: string): boolean {
    return compareSync(password, hashedPassword);
  }

  public static generateSalt(): string {
    const saltRounds: number = 10;
    const salt: string = genSaltSync(saltRounds);

    return salt;
  }

}
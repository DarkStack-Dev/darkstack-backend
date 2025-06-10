
export abstract class JwtService{
  public abstract generateAuthToken(userId: string): Promise<string>;
  public abstract generateRefreshToken(userId: string): Promise<string>;
}
export class Utils{
  public static GenerateUUID(): string {
    return crypto.randomUUID();
  }
}
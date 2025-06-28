export abstract class Entity{
  protected id: string;
  protected createdAt: Date;
  protected updatedAt: Date;
  protected isActive: boolean;

  protected constructor(id: string, createdAt: Date, updatedAt: Date, isActive: boolean) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isActive = isActive;
  }

  protected abstract validate(): void;

  public getId(): string {
    return this.id;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  protected hasUpdatedAt(){
    return this.updatedAt = new Date();
  }

  public getIsActivate(): boolean{
    return this.isActive;
  }
}
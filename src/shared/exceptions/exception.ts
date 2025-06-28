import { HttpException, HttpStatus } from "@nestjs/common";

export class Exception extends HttpException{
  private readonly internalMessage: string;
  private readonly externalMessage: string;
  private readonly context: string;

  public constructor(
    internalMessage: string, 
    externalMessage?: string, 
    context?: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(externalMessage || "Internal server error", statusCode);
    this.internalMessage = internalMessage;
    this.externalMessage = externalMessage || "Internal server error";
    this.context = context || "Unknown context";
    this.name = Exception.name;
  }

  public getInternalMessage(): string {
    return this.internalMessage;
  }

  public getExternalMessage(): string {
    return this.externalMessage;
  }

  public getContext(): string {
    return this.context;
  }
}
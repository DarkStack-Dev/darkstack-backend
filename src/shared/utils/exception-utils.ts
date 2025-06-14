import { Exception } from '../exceptions/exception';

export type ExceptionResponse = {
  statusCode: number;
  timestamp: string;
  message: string;
};

export class ExceptionUtils {
  public static buildErrorResponse(exception: Exception, statusCode: number) {
    const aResponseData: ExceptionResponse = {
      statusCode: statusCode,
      timestamp: new Date().toISOString(),
      message: exception.getExternalMessage(),
    };

    return aResponseData;
  }
}
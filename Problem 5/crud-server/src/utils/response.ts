import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ApiResponse, ApiError, PaginatedResponse } from '../types';

/**
 * Standardized API Response Helper
 */
export class ResponseHelper {
  static success<T>(res: Response, data: T, message?: string, statusCode = StatusCodes.OK): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message = 'Resource created successfully'): Response {
    return this.success(res, data, message, StatusCodes.CREATED);
  }

  static paginated<T>(res: Response, paginatedData: PaginatedResponse<T>, message?: string): Response {
    const response: ApiResponse<PaginatedResponse<T>> = {
      success: true,
      data: paginatedData,
      message,
      timestamp: new Date().toISOString(),
    };
    return res.status(StatusCodes.OK).json(response);
  }

  static error(res: Response, error: ApiError, statusCode = StatusCodes.INTERNAL_SERVER_ERROR): Response {
    const response: ApiResponse = {
      success: false,
      error,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(response);
  }

  static badRequest(res: Response, message: string, details?: ApiError['details']): Response {
    return this.error(res, { code: 'BAD_REQUEST', message, details }, StatusCodes.BAD_REQUEST);
  }

  static notFound(res: Response, message = 'Resource not found'): Response {
    return this.error(res, { code: 'NOT_FOUND', message }, StatusCodes.NOT_FOUND);
  }

  static validationError(res: Response, details: ApiError['details']): Response {
    return this.error(res, { code: 'VALIDATION_FAILED', message: 'Validation failed', details }, StatusCodes.UNPROCESSABLE_ENTITY);
  }

  static internalError(res: Response, message = 'Internal server error'): Response {
    return this.error(res, { code: 'INTERNAL_ERROR', message }, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

export default ResponseHelper;

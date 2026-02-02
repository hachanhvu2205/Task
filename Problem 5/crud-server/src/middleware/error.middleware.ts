import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/errors';
import ResponseHelper from '../utils/response';
import logger from '../utils/logger';
import config from '../config';

/**
 * Global Error Handler
 * Handles all errors and returns standardized responses
 */
export const errorHandler: ErrorRequestHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Error occurred', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  // Handle AppError (operational errors)
  if (error instanceof AppError) {
    ResponseHelper.error(
      res,
      {
        code: error.code,
        message: error.message,
        details: error.details,
        stack: config.nodeEnv === 'development' ? error.stack : undefined,
      },
      error.statusCode
    );
    return;
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    const mongooseError = error as any;
    const details = Object.keys(mongooseError.errors).map((field) => ({
      field,
      message: mongooseError.errors[field].message,
    }));
    ResponseHelper.validationError(res, details);
    return;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (error.name === 'CastError') {
    ResponseHelper.badRequest(res, 'Invalid ID format');
    return;
  }

  // Handle MongoDB duplicate key
  if ((error as any).code === 11000) {
    ResponseHelper.error(res, { code: 'DUPLICATE_KEY', message: 'Resource already exists' }, StatusCodes.CONFLICT);
    return;
  }

  // Handle JSON parse errors
  if (error instanceof SyntaxError && 'body' in error) {
    ResponseHelper.badRequest(res, 'Invalid JSON in request body');
    return;
  }

  // Unknown errors (500)
  ResponseHelper.error(
    res,
    {
      code: 'INTERNAL_ERROR',
      message: config.nodeEnv === 'production' ? 'An unexpected error occurred' : error.message,
      stack: config.nodeEnv === 'development' ? error.stack : undefined,
    },
    StatusCodes.INTERNAL_SERVER_ERROR
  );
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  ResponseHelper.notFound(res, `Endpoint ${req.method} ${req.path} not found`);
};

/**
 * Async Handler Wrapper
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

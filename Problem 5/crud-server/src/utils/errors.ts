import { StatusCodes } from 'http-status-codes';
import { ValidationError } from '../types';

/**
 * Base Application Error
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: ValidationError[];

  constructor(
    message: string,
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: ValidationError[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', details?: ValidationError[]) {
    super(message, StatusCodes.BAD_REQUEST, 'BAD_REQUEST', true, details);
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, StatusCodes.NOT_FOUND, 'NOT_FOUND', true);
  }
}

/**
 * 422 Validation Error
 */
export class ValidationFailedError extends AppError {
  constructor(message: string = 'Validation failed', details?: ValidationError[]) {
    super(message, StatusCodes.UNPROCESSABLE_ENTITY, 'VALIDATION_FAILED', true, details);
  }
}

/**
 * 429 Too Many Requests
 */
export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, StatusCodes.TOO_MANY_REQUESTS, 'RATE_LIMIT_EXCEEDED', true);
  }
}

/**
 * 500 Database Error
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed') {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR, 'DATABASE_ERROR', false);
  }
}

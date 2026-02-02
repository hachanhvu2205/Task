import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError as ExpressValidationError } from 'express-validator';
import { ValidationError } from '../types';
import ResponseHelper from '../utils/response';
import logger from '../utils/logger';

/**
 * Handle validation results from express-validator
 */
export const handleValidationResult = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const validationErrors: ValidationError[] = errors.array().map((error: ExpressValidationError) => {
      if (error.type === 'field') {
        return { field: error.path, message: error.msg, value: error.value };
      }
      return { field: 'unknown', message: error.msg };
    });

    logger.warn('Validation failed', { errors: validationErrors });
    ResponseHelper.validationError(res, validationErrors);
    return;
  }

  next();
};

/**
 * Extract pagination from query
 */
export const extractPagination = (req: Request, _res: Response, next: NextFunction): void => {
  const { page = '1', limit = '10', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  (req as any).pagination = {
    page: parseInt(page as string, 10) || 1,
    limit: Math.min(parseInt(limit as string, 10) || 10, 100),
    sortBy: sortBy as string,
    sortOrder: sortOrder as 'asc' | 'desc',
  };

  next();
};

/**
 * Extract filters from query
 */
export const extractFilters = (req: Request, _res: Response, next: NextFunction): void => {
  const { status, priority, search, dueDate, dueBefore, dueAfter, tags } = req.query;

  (req as any).filters = {
    status: status as string | undefined,
    priority: priority as string | undefined,
    search: search as string | undefined,
    dueDate: dueDate as string | undefined,
    dueBefore: dueBefore as string | undefined,
    dueAfter: dueAfter as string | undefined,
    tags: typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
  };

  next();
};

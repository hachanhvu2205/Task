import { Request, Response, NextFunction } from 'express';
import { CreateTaskDto, UpdateTaskDto, TaskStatus, TaskPriority } from './types';

const VALID_STATUSES: TaskStatus[] = ['pending', 'in_progress', 'completed', 'cancelled'];
const VALID_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];

export function validateCreateTask(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const body = req.body as CreateTaskDto;
  const errors: string[] = [];

  
  if (!body.title || typeof body.title !== 'string') {
    errors.push('Title is required and must be a string');
  } else if (body.title.trim().length === 0) {
    errors.push('Title cannot be empty');
  } else if (body.title.length > 200) {
    errors.push('Title must be 200 characters or less');
  }


  if (body.description !== undefined && typeof body.description !== 'string') {
    errors.push('Description must be a string');
  }

 
  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  
  if (body.priority !== undefined && !VALID_PRIORITIES.includes(body.priority)) {
    errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    });
    return;
  }

  next();
}

export function validateUpdateTask(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const body = req.body as UpdateTaskDto;
  const errors: string[] = [];

  
  const hasValidField = ['title', 'description', 'status', 'priority'].some(
    (key) => body[key as keyof UpdateTaskDto] !== undefined
  );

  if (!hasValidField) {
    errors.push('At least one field (title, description, status, priority) must be provided');
  }


  if (body.title !== undefined) {
    if (typeof body.title !== 'string') {
      errors.push('Title must be a string');
    } else if (body.title.trim().length === 0) {
      errors.push('Title cannot be empty');
    } else if (body.title.length > 200) {
      errors.push('Title must be 200 characters or less');
    }
  }

  
  if (body.description !== undefined && typeof body.description !== 'string') {
    errors.push('Description must be a string');
  }

  
  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  
  if (body.priority !== undefined && !VALID_PRIORITIES.includes(body.priority)) {
    errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    });
    return;
  }

  next();
}

export function validateQueryParams(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { status, priority, limit, offset } = req.query;
  const errors: string[] = [];

  if (status && !VALID_STATUSES.includes(status as TaskStatus)) {
    errors.push(`Status filter must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (priority && !VALID_PRIORITIES.includes(priority as TaskPriority)) {
    errors.push(`Priority filter must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }

  if (limit !== undefined) {
    const limitNum = parseInt(limit as string, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push('Limit must be a number between 1 and 100');
    }
  }

  if (offset !== undefined) {
    const offsetNum = parseInt(offset as string, 10);
    if (isNaN(offsetNum) || offsetNum < 0) {
      errors.push('Offset must be a non-negative number');
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Invalid query parameters',
      details: errors,
    });
    return;
  }

  next();
}

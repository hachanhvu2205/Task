import { body, param, query, ValidationChain } from 'express-validator';
import { TaskStatus, TaskPriority } from '../types';

const validStatuses = Object.values(TaskStatus);
const validPriorities = Object.values(TaskPriority);

/**
 * Validate task ID parameter
 */
export const validateTaskId: ValidationChain[] = [
  param('taskId')
    .notEmpty().withMessage('Task ID is required')
    .isString().withMessage('Task ID must be a string')
    .isLength({ min: 24, max: 24 }).withMessage('Task ID must be a valid MongoDB ObjectId'),
];

/**
 * Validate create task request
 */
export const validateCreateTask: ValidationChain[] = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isString().withMessage('Title must be a string')
    .trim()
    .isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),

  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),

  body('status')
    .optional()
    .isIn(validStatuses).withMessage(`Status must be one of: ${validStatuses.join(', ')}`),

  body('priority')
    .optional()
    .isIn(validPriorities).withMessage(`Priority must be one of: ${validPriorities.join(', ')}`),

  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid ISO 8601 date'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .isString().trim()
    .isLength({ min: 1, max: 50 }).withMessage('Each tag must be 1-50 characters'),
];

/**
 * Validate update task request
 */
export const validateUpdateTask: ValidationChain[] = [
  body('title')
    .optional()
    .isString().withMessage('Title must be a string')
    .trim()
    .isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),

  body('description')
    .optional()
    .isString().withMessage('Description must be a string')
    .trim()
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),

  body('status')
    .optional()
    .isIn(validStatuses).withMessage(`Status must be one of: ${validStatuses.join(', ')}`),

  body('priority')
    .optional()
    .isIn(validPriorities).withMessage(`Priority must be one of: ${validPriorities.join(', ')}`),

  body('dueDate')
    .optional()
    .isISO8601().withMessage('Due date must be a valid ISO 8601 date'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .isString().trim()
    .isLength({ min: 1, max: 50 }).withMessage('Each tag must be 1-50 characters'),

  body().custom((value) => {
    const fields = ['title', 'description', 'status', 'priority', 'dueDate', 'tags'];
    const provided = Object.keys(value).filter((k) => fields.includes(k) && value[k] !== undefined);
    if (provided.length === 0) {
      throw new Error('At least one field must be provided for update');
    }
    return true;
  }),
];

/**
 * Validate query parameters
 */
export const validateTaskQuery: ValidationChain[] = [
  query('status').optional().isIn(validStatuses).withMessage(`Status must be one of: ${validStatuses.join(', ')}`),
  query('priority').optional().isIn(validPriorities).withMessage(`Priority must be one of: ${validPriorities.join(', ')}`),
  query('search').optional().isString().trim().isLength({ max: 100 }).withMessage('Search max 100 characters'),
  query('dueDate').optional().isISO8601().withMessage('dueDate must be ISO 8601'),
  query('dueBefore').optional().isISO8601().withMessage('dueBefore must be ISO 8601'),
  query('dueAfter').optional().isISO8601().withMessage('dueAfter must be ISO 8601'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be >= 1').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100').toInt(),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'title', 'status', 'priority', 'dueDate']).withMessage('Invalid sortBy'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('sortOrder must be asc or desc'),
];

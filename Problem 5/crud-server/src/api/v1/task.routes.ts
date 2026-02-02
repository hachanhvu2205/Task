import { Router } from 'express';
import { taskController } from '../../controllers/task.controller';
import { validateTaskId, validateCreateTask, validateUpdateTask, validateTaskQuery } from '../../validators/task.validator';
import { handleValidationResult, extractPagination, extractFilters } from '../../middleware/validation.middleware';

const router = Router();

/**
 * GET /api/v1/tasks/stats - Get task statistics
 */
router.get('/stats', taskController.getStatistics);

/**
 * GET /api/v1/tasks - List all tasks with filters
 */
router.get(
  '/',
  validateTaskQuery,
  handleValidationResult,
  extractFilters,
  extractPagination,
  taskController.getTasks
);

/**
 * POST /api/v1/tasks - Create a new task
 */
router.post(
  '/',
  validateCreateTask,
  handleValidationResult,
  taskController.createTask
);

/**
 * GET /api/v1/tasks/:taskId - Get task by ID
 */
router.get(
  '/:taskId',
  validateTaskId,
  handleValidationResult,
  taskController.getTaskById
);

/**
 * PUT /api/v1/tasks/:taskId - Update task
 */
router.put(
  '/:taskId',
  validateTaskId,
  validateUpdateTask,
  handleValidationResult,
  taskController.updateTask
);

/**
 * PATCH /api/v1/tasks/:taskId - Partial update
 */
router.patch(
  '/:taskId',
  validateTaskId,
  validateUpdateTask,
  handleValidationResult,
  taskController.updateTask
);

/**
 * DELETE /api/v1/tasks/:taskId - Delete task
 */
router.delete(
  '/:taskId',
  validateTaskId,
  handleValidationResult,
  taskController.deleteTask
);

export default router;

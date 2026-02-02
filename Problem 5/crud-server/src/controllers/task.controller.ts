import { Request, Response } from 'express';
import { taskService } from '../services/task.service';
import ResponseHelper from '../utils/response';
import { CreateTaskDTO, UpdateTaskDTO, TaskFilters, PaginationOptions } from '../types';
import { asyncHandler } from '../middleware/error.middleware';
import logger from '../utils/logger';

/**
 * Task Controller
 * Handles HTTP requests and delegates to service layer
 */
class TaskController {
  /**
   * POST /api/v1/tasks - Create a new task
   */
  createTask = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data: CreateTaskDTO = req.body;
    logger.debug('Controller: Creating task', { title: data.title });

    const task = await taskService.createTask(data);
    ResponseHelper.created(res, task, 'Task created successfully');
  });

  /**
   * GET /api/v1/tasks - Get all tasks with filters
   */
  getTasks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const filters: TaskFilters = (req as any).filters || {};
    const pagination: PaginationOptions = (req as any).pagination || {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    logger.debug('Controller: Getting tasks', { filters, pagination });

    const result = await taskService.getTasks(filters, pagination);
    ResponseHelper.paginated(res, result, 'Tasks retrieved successfully');
  });

  /**
   * GET /api/v1/tasks/:taskId - Get task by ID
   */
  getTaskById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { taskId } = req.params;
    logger.debug('Controller: Getting task', { taskId });

    const task = await taskService.getTaskById(taskId);
    ResponseHelper.success(res, task, 'Task retrieved successfully');
  });

  /**
   * PUT /api/v1/tasks/:taskId - Update task
   */
  updateTask = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { taskId } = req.params;
    const data: UpdateTaskDTO = req.body;
    logger.debug('Controller: Updating task', { taskId, updates: Object.keys(data) });

    const task = await taskService.updateTask(taskId, data);
    ResponseHelper.success(res, task, 'Task updated successfully');
  });

  /**
   * DELETE /api/v1/tasks/:taskId - Delete task
   */
  deleteTask = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { taskId } = req.params;
    logger.debug('Controller: Deleting task', { taskId });

    await taskService.deleteTask(taskId);
    ResponseHelper.success(res, null, 'Task deleted successfully');
  });

  /**
   * GET /api/v1/tasks/stats - Get statistics
   */
  getStatistics = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    logger.debug('Controller: Getting statistics');

    const stats = await taskService.getStatistics();
    ResponseHelper.success(res, stats, 'Statistics retrieved successfully');
  });
}

export const taskController = new TaskController();
export default taskController;

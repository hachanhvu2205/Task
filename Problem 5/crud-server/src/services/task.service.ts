import {
  ITask,
  CreateTaskDTO,
  UpdateTaskDTO,
  TaskFilters,
  PaginationOptions,
  PaginatedResponse,
} from '../types';
import { taskRepository } from '../repositories/task.repository';
import { cacheService } from './cache.service';
import { NotFoundError } from '../utils/errors';
import logger from '../utils/logger';
import config from '../config';

const CacheKeys = {
  task: (id: string) => `task:${id}`,
  taskList: (hash: string) => `tasks:list:${hash}`,
  stats: () => 'tasks:stats',
  pattern: () => 'tasks:*',
};

/**
 * Task Service
 * Business Logic Layer with caching support
 */
class TaskService {
  async createTask(data: CreateTaskDTO): Promise<ITask> {
    logger.info('Creating task', { title: data.title });

    const task = await taskRepository.create(data);

    // Cache new task and invalidate lists
    await cacheService.set(CacheKeys.task(task.id), task, config.cacheTtl);
    await cacheService.deletePattern(CacheKeys.pattern());

    return task;
  }

  async getTaskById(id: string): Promise<ITask> {
    // Try cache first
    const cached = await cacheService.get<ITask>(CacheKeys.task(id));
    if (cached) {
      logger.debug(`Cache hit for task ${id}`);
      return cached;
    }

    const task = await taskRepository.findById(id);
    if (!task) {
      throw new NotFoundError(`Task with ID ${id} not found`);
    }

    // Cache result
    await cacheService.set(CacheKeys.task(id), task, config.cacheTtl);

    return task;
  }

  async getTasks(filters: TaskFilters, pagination: PaginationOptions): Promise<PaginatedResponse<ITask>> {
    const cacheKey = CacheKeys.taskList(JSON.stringify({ ...filters, ...pagination }));

    // Try cache first
    const cached = await cacheService.get<PaginatedResponse<ITask>>(cacheKey);
    if (cached) {
      logger.debug('Cache hit for task list');
      return cached;
    }

    const result = await taskRepository.findAll(filters, pagination);

    // Cache result (shorter TTL for lists)
    await cacheService.set(cacheKey, result, Math.floor(config.cacheTtl / 2));

    return result;
  }

  async updateTask(id: string, data: UpdateTaskDTO): Promise<ITask> {
    logger.info(`Updating task ${id}`, { updates: Object.keys(data) });

    const exists = await taskRepository.exists(id);
    if (!exists) {
      throw new NotFoundError(`Task with ID ${id} not found`);
    }

    const task = await taskRepository.update(id, data);
    if (!task) {
      throw new NotFoundError(`Task with ID ${id} not found`);
    }

    // Update cache
    await cacheService.set(CacheKeys.task(id), task, config.cacheTtl);
    await cacheService.deletePattern(CacheKeys.pattern());

    return task;
  }

  async deleteTask(id: string): Promise<void> {
    logger.info(`Deleting task ${id}`);

    const exists = await taskRepository.exists(id);
    if (!exists) {
      throw new NotFoundError(`Task with ID ${id} not found`);
    }

    const deleted = await taskRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Task with ID ${id} not found`);
    }

    // Clear cache
    await cacheService.delete(CacheKeys.task(id));
    await cacheService.deletePattern(CacheKeys.pattern());
  }

  async getStatistics(): Promise<{ total: number; byStatus: Record<string, number>; byPriority: Record<string, number> }> {
    const cached = await cacheService.get<{ total: number; byStatus: Record<string, number>; byPriority: Record<string, number> }>(CacheKeys.stats());
    if (cached) return cached;

    const stats = await taskRepository.getStatistics();
    await cacheService.set(CacheKeys.stats(), stats, 60);

    return stats;
  }
}

export const taskService = new TaskService();
export default taskService;

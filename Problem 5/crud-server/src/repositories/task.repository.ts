import mongoose, { FilterQuery, SortOrder } from 'mongoose';
import TaskModel, { ITaskDocument } from '../models/task.model';
import {
  ITask,
  ITaskRepository,
  CreateTaskDTO,
  UpdateTaskDTO,
  TaskFilters,
  PaginationOptions,
  PaginatedResponse,
  TaskStatus,
  TaskPriority,
} from '../types';
import { DatabaseError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * MongoDB Task Repository
 * Data Access Layer - handles all database operations
 */
export class TaskRepository implements ITaskRepository {
  private toTask(doc: ITaskDocument): ITask {
    return {
      id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      status: doc.status as TaskStatus,
      priority: doc.priority as TaskPriority,
      dueDate: doc.dueDate,
      tags: doc.tags,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private buildFilterQuery(filters: TaskFilters): FilterQuery<ITaskDocument> {
    const query: FilterQuery<ITaskDocument> = {};

    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    if (filters.dueDate) query.dueDate = new Date(filters.dueDate);
    if (filters.dueBefore) query.dueDate = { ...query.dueDate, $lte: new Date(filters.dueBefore) };
    if (filters.dueAfter) query.dueDate = { ...query.dueDate, $gte: new Date(filters.dueAfter) };
    if (filters.tags?.length) query.tags = { $in: filters.tags };

    return query;
  }

  async create(data: CreateTaskDTO): Promise<ITask> {
    try {
      const task = new TaskModel({
        title: data.title,
        description: data.description || '',
        status: data.status || TaskStatus.PENDING,
        priority: data.priority || TaskPriority.MEDIUM,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        tags: data.tags || [],
      });

      const saved = await task.save();
      logger.info(`Task created: ${saved._id}`);
      return this.toTask(saved);
    } catch (error) {
      logger.error('Error creating task:', error);
      throw new DatabaseError('Failed to create task');
    }
  }

  async findById(id: string): Promise<ITask | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const task = await TaskModel.findById(id);
      return task ? this.toTask(task) : null;
    } catch (error) {
      logger.error(`Error finding task ${id}:`, error);
      throw new DatabaseError('Failed to find task');
    }
  }

  async findAll(filters: TaskFilters, pagination: PaginationOptions): Promise<PaginatedResponse<ITask>> {
    try {
      const query = this.buildFilterQuery(filters);
      const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
      const skip = (page - 1) * limit;
      const sort: { [key: string]: SortOrder } = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      const [tasks, total] = await Promise.all([
        TaskModel.find(query).sort(sort).skip(skip).limit(limit).lean(),
        TaskModel.countDocuments(query),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: tasks.map((t) => this.toTask(t as unknown as ITaskDocument)),
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      logger.error('Error finding tasks:', error);
      throw new DatabaseError('Failed to find tasks');
    }
  }

  async update(id: string, data: UpdateTaskDTO): Promise<ITask | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;

      const updateData: Partial<ITaskDocument> = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.dueDate !== undefined) updateData.dueDate = new Date(data.dueDate);
      if (data.tags !== undefined) updateData.tags = data.tags;

      const task = await TaskModel.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });

      if (task) {
        logger.info(`Task updated: ${id}`);
        return this.toTask(task);
      }
      return null;
    } catch (error) {
      logger.error(`Error updating task ${id}:`, error);
      throw new DatabaseError('Failed to update task');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) return false;
      const result = await TaskModel.findByIdAndDelete(id);
      if (result) {
        logger.info(`Task deleted: ${id}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Error deleting task ${id}:`, error);
      throw new DatabaseError('Failed to delete task');
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) return false;
      const count = await TaskModel.countDocuments({ _id: id });
      return count > 0;
    } catch (error) {
      logger.error(`Error checking task existence ${id}:`, error);
      throw new DatabaseError('Failed to check task existence');
    }
  }

  async getStatistics(): Promise<{ total: number; byStatus: Record<string, number>; byPriority: Record<string, number> }> {
    try {
      const [total, statusStats, priorityStats] = await Promise.all([
        TaskModel.countDocuments(),
        TaskModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        TaskModel.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      ]);

      const byStatus: Record<string, number> = {};
      statusStats.forEach((s) => (byStatus[s._id] = s.count));

      const byPriority: Record<string, number> = {};
      priorityStats.forEach((p) => (byPriority[p._id] = p.count));

      return { total, byStatus, byPriority };
    } catch (error) {
      logger.error('Error getting statistics:', error);
      throw new DatabaseError('Failed to get statistics');
    }
  }
}

export const taskRepository = new TaskRepository();
export default taskRepository;

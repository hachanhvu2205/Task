import { Request } from 'express';

// ============ ENUMS ============

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// ============ INTERFACES ============

export interface ITask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============ DTOs ============

export interface CreateTaskDTO {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  tags?: string[];
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  tags?: string[];
}

// ============ FILTERS & PAGINATION ============

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  dueDate?: string;
  dueBefore?: string;
  dueAfter?: string;
  tags?: string[];
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ============ API RESPONSES ============

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ValidationError[];
  stack?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

// ============ EXTENDED REQUEST ============

export interface TypedRequest<T = unknown> extends Request {
  body: T;
  filters?: TaskFilters;
  pagination?: PaginationOptions;
}

// ============ REPOSITORY INTERFACE ============

export interface ITaskRepository {
  create(data: CreateTaskDTO): Promise<ITask>;
  findById(id: string): Promise<ITask | null>;
  findAll(filters: TaskFilters, pagination: PaginationOptions): Promise<PaginatedResponse<ITask>>;
  update(id: string, data: UpdateTaskDTO): Promise<ITask | null>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}

// ============ CACHE INTERFACE ============

export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  deletePattern(pattern: string): Promise<void>;
}

import { Router, Request, Response } from 'express';
import { taskRepository } from './repository';
import {
  validateCreateTask,
  validateUpdateTask,
  validateQueryParams,
} from './validation';
import { CreateTaskDto, UpdateTaskDto, TaskFilters } from './types';

const router = Router();


router.post('/', validateCreateTask, (req: Request, res: Response) => {
  try {
    const dto = req.body as CreateTaskDto;
    const task = taskRepository.create(dto);

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create task',
    });
  }
});


router.get('/', validateQueryParams, (req: Request, res: Response) => {
  try {
    const filters: TaskFilters = {
      status: req.query.status as TaskFilters['status'],
      priority: req.query.priority as TaskFilters['priority'],
      search: req.query.search as string,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
      offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0,
    };

    const result = taskRepository.findAll(filters);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error listing tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list tasks',
    });
  }
});


router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const task = taskRepository.findById(id);

    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Task not found',
      });
      return;
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Error getting task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get task',
    });
  }
});


router.put('/:id', validateUpdateTask, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dto = req.body as UpdateTaskDto;
    const task = taskRepository.update(id, dto);

    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Task not found',
      });
      return;
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task',
    });
  }
});


router.patch('/:id', validateUpdateTask, (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dto = req.body as UpdateTaskDto;
    const task = taskRepository.update(id, dto);

    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Task not found',
      });
      return;
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update task',
    });
  }
});


router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = taskRepository.delete(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: 'Task not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete task',
    });
  }
});

export default router;

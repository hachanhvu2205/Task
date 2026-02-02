import request from 'supertest';
import express from 'express';
import taskRoutes from '../src/api/v1/task.routes';
import { errorHandler, notFoundHandler } from '../src/middleware/error.middleware';
import { TaskStatus, TaskPriority } from '../src/types';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/v1/tasks', taskRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

describe('Task API', () => {
  let taskId: string;

  describe('POST /api/v1/tasks', () => {
    it('should create a task with valid data', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .send({
          title: 'Test Task',
          description: 'Test Description',
          priority: TaskPriority.HIGH,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Test Task');
      expect(res.body.data.status).toBe(TaskStatus.PENDING);
      expect(res.body.data.id).toBeDefined();

      taskId = res.body.data.id;
    });

    it('should fail with missing title', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .send({ description: 'No title' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('should fail with invalid status', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .send({ title: 'Test', status: 'invalid' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/tasks', () => {
    beforeEach(async () => {
      // Create test tasks
      await request(app).post('/api/v1/tasks').send({ title: 'Task 1', status: TaskStatus.PENDING });
      await request(app).post('/api/v1/tasks').send({ title: 'Task 2', status: TaskStatus.COMPLETED });
      await request(app).post('/api/v1/tasks').send({ title: 'Task 3', priority: TaskPriority.HIGH });
    });

    it('should list all tasks', async () => {
      const res = await request(app).get('/api/v1/tasks');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.data).toBeInstanceOf(Array);
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should filter by status', async () => {
      const res = await request(app).get('/api/v1/tasks?status=pending');

      expect(res.status).toBe(200);
      expect(res.body.data.data.every((t: any) => t.status === 'pending')).toBe(true);
    });

    it('should filter by priority', async () => {
      const res = await request(app).get('/api/v1/tasks?priority=high');

      expect(res.status).toBe(200);
      expect(res.body.data.data.every((t: any) => t.priority === 'high')).toBe(true);
    });

    it('should paginate results', async () => {
      const res = await request(app).get('/api/v1/tasks?page=1&limit=2');

      expect(res.status).toBe(200);
      expect(res.body.data.data.length).toBeLessThanOrEqual(2);
      expect(res.body.data.pagination.page).toBe(1);
      expect(res.body.data.pagination.limit).toBe(2);
    });

    it('should search by title', async () => {
      const res = await request(app).get('/api/v1/tasks?search=Task%201');

      expect(res.status).toBe(200);
      expect(res.body.data.data.some((t: any) => t.title.includes('Task 1'))).toBe(true);
    });
  });

  describe('GET /api/v1/tasks/:taskId', () => {
    let createdTaskId: string;

    beforeEach(async () => {
      const res = await request(app).post('/api/v1/tasks').send({ title: 'Get Test' });
      createdTaskId = res.body.data.id;
    });

    it('should get task by ID', async () => {
      const res = await request(app).get(`/api/v1/tasks/${createdTaskId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdTaskId);
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(app).get('/api/v1/tasks/507f1f77bcf86cd799439011');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 422 for invalid ID format', async () => {
      const res = await request(app).get('/api/v1/tasks/invalid-id');

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/tasks/:taskId', () => {
    let createdTaskId: string;

    beforeEach(async () => {
      const res = await request(app).post('/api/v1/tasks').send({ title: 'Update Test' });
      createdTaskId = res.body.data.id;
    });

    it('should update task', async () => {
      const res = await request(app)
        .put(`/api/v1/tasks/${createdTaskId}`)
        .send({ title: 'Updated Title', status: TaskStatus.COMPLETED });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Title');
      expect(res.body.data.status).toBe(TaskStatus.COMPLETED);
    });

    it('should fail with no fields', async () => {
      const res = await request(app)
        .put(`/api/v1/tasks/${createdTaskId}`)
        .send({});

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(app)
        .put('/api/v1/tasks/507f1f77bcf86cd799439011')
        .send({ title: 'Updated' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/tasks/:taskId', () => {
    let createdTaskId: string;

    beforeEach(async () => {
      const res = await request(app).post('/api/v1/tasks').send({ title: 'Delete Test' });
      createdTaskId = res.body.data.id;
    });

    it('should delete task', async () => {
      const res = await request(app).delete(`/api/v1/tasks/${createdTaskId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify deletion
      const getRes = await request(app).get(`/api/v1/tasks/${createdTaskId}`);
      expect(getRes.status).toBe(404);
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(app).delete('/api/v1/tasks/507f1f77bcf86cd799439011');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/tasks/stats', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/tasks').send({ title: 'Task 1', status: TaskStatus.PENDING });
      await request(app).post('/api/v1/tasks').send({ title: 'Task 2', status: TaskStatus.COMPLETED });
    });

    it('should return statistics', async () => {
      const res = await request(app).get('/api/v1/tasks/stats');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBeDefined();
      expect(res.body.data.byStatus).toBeDefined();
      expect(res.body.data.byPriority).toBeDefined();
    });
  });
});

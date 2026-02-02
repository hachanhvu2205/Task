import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';

import config from './config';
import logger from './utils/logger';
import apiV1Routes from './api/v1';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { standardRateLimiter } from './middleware/rateLimit.middleware';
import { cacheService } from './services/cache.service';

const app = express();

// ============ SECURITY MIDDLEWARE ============
app.use(helmet()); // Security headers
app.use(cors()); // CORS
app.use(compression()); // Gzip compression

// ============ REQUEST PARSING ============
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ============ LOGGING ============
app.use(morgan('combined', {
  stream: { write: (message) => logger.http(message.trim()) },
  skip: (req) => req.path === '/health' || req.path === '/ready',
}));

// ============ RATE LIMITING ============
app.use(standardRateLimiter);

// ============ HEALTH CHECKS ============
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/ready', async (_req: Request, res: Response) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const redisStatus = cacheService.isAvailable() ? 'connected' : 'disconnected';

  res.json({
    status: mongoStatus === 'connected' ? 'ready' : 'not ready',
    services: {
      mongodb: mongoStatus,
      redis: redisStatus,
    },
    timestamp: new Date().toISOString(),
  });
});

// ============ API INFO ============
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'Task Manager API',
    version: '1.0.0',
    description: 'Production-ready CRUD API with Express, TypeScript, MongoDB, and Redis',
    documentation: '/api-docs',
    endpoints: {
      'GET /health': 'Health check',
      'GET /ready': 'Readiness check',
      'GET /api/v1/tasks': 'List tasks with filters',
      'POST /api/v1/tasks': 'Create a task',
      'GET /api/v1/tasks/:taskId': 'Get task by ID',
      'PUT /api/v1/tasks/:taskId': 'Update task',
      'PATCH /api/v1/tasks/:taskId': 'Partial update',
      'DELETE /api/v1/tasks/:taskId': 'Delete task',
      'GET /api/v1/tasks/stats': 'Get statistics',
    },
    filters: {
      status: ['pending', 'in-progress', 'completed', 'cancelled'],
      priority: ['low', 'medium', 'high', 'urgent'],
      search: 'Search in title/description',
      dueBefore: 'ISO 8601 date',
      dueAfter: 'ISO 8601 date',
      page: 'Page number (default: 1)',
      limit: 'Items per page (1-100, default: 10)',
      sortBy: 'createdAt, updatedAt, title, status, priority, dueDate',
      sortOrder: 'asc, desc',
    },
  });
});

// ============ API ROUTES ============
app.use('/api/v1', apiV1Routes);

// ============ ERROR HANDLING ============
app.use(notFoundHandler);
app.use(errorHandler);

// ============ DATABASE CONNECTION ============
async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(config.mongodbUri);
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
}

// ============ GRACEFUL SHUTDOWN ============
async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`${signal} received, shutting down gracefully`);

  try {
    await mongoose.connection.close();
    logger.info('MongoDB disconnected');

    await cacheService.disconnect();
    logger.info('Redis disconnected');

    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ============ START SERVER ============
async function startServer(): Promise<void> {
  try {
    // Connect to databases
    await connectDatabase();
    await cacheService.connect();

    // Start server
    app.listen(config.port, () => {
      logger.info(`🚀 Server running on http://localhost:${config.port}`);
      logger.info(`📚 API docs at http://localhost:${config.port}/`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;

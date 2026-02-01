import express, { Request, Response, NextFunction } from 'express';
import taskRoutes from './routes';
import { initDatabase } from './database';

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});


app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'CRUD Server API',
    version: '1.0.0',
    description: 'A RESTful API for task management',
    endpoints: {
      'GET /health': 'Health check',
      'GET /tasks': 'List all tasks with optional filters',
      'POST /tasks': 'Create a new task',
      'GET /tasks/:id': 'Get a specific task',
      'PUT /tasks/:id': 'Update a task',
      'PATCH /tasks/:id': 'Partially update a task',
      'DELETE /tasks/:id': 'Delete a task',
    },
    filters: {
      status: ['pending', 'in_progress', 'completed', 'cancelled'],
      priority: ['low', 'medium', 'high'],
      search: 'Search in title and description',
      limit: 'Number of results (1-100, default: 10)',
      offset: 'Pagination offset (default: 0)',
    },
  });
});


app.use('/tasks', taskRoutes);


app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});


app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});


async function main() {
  try {
    await initDatabase();
    console.log('📦 Database initialized');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API documentation available at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();

export default app;

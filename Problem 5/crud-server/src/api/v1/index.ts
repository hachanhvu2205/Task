import { Router } from 'express';
import taskRoutes from './task.routes';

const router = Router();

// Task routes
router.use('/tasks', taskRoutes);

export default router;

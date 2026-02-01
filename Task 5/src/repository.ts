import { v4 as uuidv4 } from 'uuid';
import { getDatabase, saveDatabase } from './database';
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilters,
  PaginatedResponse,
} from './types';


function rowToTask(row: unknown[]): Task {
  return {
    id: row[0] as string,
    title: row[1] as string,
    description: row[2] as string,
    status: row[3] as Task['status'],
    priority: row[4] as Task['priority'],
    createdAt: row[5] as string,
    updatedAt: row[6] as string,
  };
}

export class TaskRepository {
  create(dto: CreateTaskDto): Task {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO tasks (id, title, description, status, priority, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        dto.title,
        dto.description || '',
        dto.status || 'pending',
        dto.priority || 'medium',
        now,
        now,
      ]
    );

    saveDatabase();
    return this.findById(id)!;
  }

  findById(id: string): Task | null {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    stmt.bind([id]);
    
    if (stmt.step()) {
      const row = stmt.get();
      stmt.free();
      return rowToTask(row);
    }
    
    stmt.free();
    return null;
  }

  findAll(filters: TaskFilters = {}): PaginatedResponse<Task> {
    const db = getDatabase();
    const { status, priority, search, limit = 10, offset = 0 } = filters;


    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (priority) {
      conditions.push('priority = ?');
      params.push(priority);
    }

    if (search) {
      conditions.push('(title LIKE ? OR description LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

 
    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM tasks ${whereClause}`);
    if (params.length > 0) {
      countStmt.bind(params);
    }
    countStmt.step();
    const total = countStmt.get()[0] as number;
    countStmt.free();

  
    const dataParams = [...params, limit, offset];
    const dataStmt = db.prepare(`
      SELECT * FROM tasks 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);
    dataStmt.bind(dataParams);

    const rows: Task[] = [];
    while (dataStmt.step()) {
      rows.push(rowToTask(dataStmt.get()));
    }
    dataStmt.free();

    return {
      data: rows,
      total,
      limit,
      offset,
    };
  }

  update(id: string, dto: UpdateTaskDto): Task | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const db = getDatabase();
    const updates: string[] = [];
    const params: (string | number)[] = [];

    if (dto.title !== undefined) {
      updates.push('title = ?');
      params.push(dto.title);
    }

    if (dto.description !== undefined) {
      updates.push('description = ?');
      params.push(dto.description);
    }

    if (dto.status !== undefined) {
      updates.push('status = ?');
      params.push(dto.status);
    }

    if (dto.priority !== undefined) {
      updates.push('priority = ?');
      params.push(dto.priority);
    }

    if (updates.length === 0) {
      return existing;
    }

    updates.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);

    db.run(
      `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    saveDatabase();
    return this.findById(id);
  }

  delete(id: string): boolean {
    const db = getDatabase();
    const existing = this.findById(id);
    if (!existing) return false;

    db.run('DELETE FROM tasks WHERE id = ?', [id]);
    saveDatabase();
    return true;
  }
}

export const taskRepository = new TaskRepository();

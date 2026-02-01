# CRUD Server

A RESTful backend server built with ExpressJS and TypeScript for task management. This server provides a complete set of CRUD operations with data persistence using SQLite.

## Features

- **Full CRUD Operations**: Create, Read, Update, and Delete tasks
- **Data Persistence**: SQLite database with better-sqlite3
- **Filtering & Pagination**: Filter tasks by status, priority, and search text
- **Input Validation**: Request validation with detailed error messages
- **TypeScript**: Fully typed codebase
- **RESTful API Design**: Standard HTTP methods and status codes

## Prerequisites

- Node.js v18 or higher
- npm v9 or higher

## Installation

1. Clone or download the project:
   ```bash
   cd crud-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode (with hot reload)
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000` by default.

## Configuration

Environment variables:
- `PORT`: Server port (default: 3000)
- `DB_PATH`: Path to SQLite database file (default: `./data/tasks.db`)

Example:
```bash
PORT=8080 DB_PATH=./mydata/tasks.db npm start
```

## API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### Health Check
```
GET /health
```
Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### List Tasks
```
GET /tasks
```

Query Parameters:
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `pending`, `in_progress`, `completed`, `cancelled` |
| `priority` | string | Filter by priority: `low`, `medium`, `high` |
| `search` | string | Search in title and description |
| `limit` | number | Number of results (1-100, default: 10) |
| `offset` | number | Pagination offset (default: 0) |

Example:
```bash
curl "http://localhost:3000/tasks?status=pending&priority=high&limit=5"
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Task title",
      "description": "Task description",
      "status": "pending",
      "priority": "high",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 1,
  "limit": 5,
  "offset": 0
}
```

#### Create Task
```
POST /tasks
Content-Type: application/json
```

Request Body:
```json
{
  "title": "Task title (required)",
  "description": "Task description (optional)",
  "status": "pending (optional, default: pending)",
  "priority": "medium (optional, default: medium)"
}
```

Example:
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Complete project", "description": "Finish the CRUD server", "priority": "high"}'
```

Response (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Complete project",
    "description": "Finish the CRUD server",
    "status": "pending",
    "priority": "high",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Get Task by ID
```
GET /tasks/:id
```

Example:
```bash
curl http://localhost:3000/tasks/550e8400-e29b-41d4-a716-446655440000
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Complete project",
    "description": "Finish the CRUD server",
    "status": "pending",
    "priority": "high",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Update Task
```
PUT /tasks/:id
Content-Type: application/json
```
or
```
PATCH /tasks/:id
Content-Type: application/json
```

Request Body (all fields optional, but at least one required):
```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "in_progress",
  "priority": "low"
}
```

Example:
```bash
curl -X PUT http://localhost:3000/tasks/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Complete project",
    "description": "Finish the CRUD server",
    "status": "completed",
    "priority": "high",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

#### Delete Task
```
DELETE /tasks/:id
```

Example:
```bash
curl -X DELETE http://localhost:3000/tasks/550e8400-e29b-41d4-a716-446655440000
```

Response:
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

### Error Responses

#### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": ["Title is required and must be a string"]
}
```

#### Not Found (404)
```json
{
  "success": false,
  "error": "Task not found"
}
```

#### Server Error (500)
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Project Structure

```
crud-server/
├── src/
│   ├── index.ts        # Application entry point
│   ├── database.ts     # SQLite database setup
│   ├── repository.ts   # Data access layer
│   ├── routes.ts       # API route handlers
│   ├── types.ts        # TypeScript interfaces
│   └── validation.ts   # Request validation middleware
├── data/
│   └── tasks.db        # SQLite database (auto-created)
├── dist/               # Compiled JavaScript (after build)
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production server |

## Testing the API

You can test the API using curl, Postman, or any HTTP client. Here's a quick test sequence:

```bash
# 1. Create a task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn TypeScript", "priority": "high"}'

# 2. List all tasks
curl http://localhost:3000/tasks

# 3. Get the created task (replace with actual ID)
curl http://localhost:3000/tasks/<task-id>

# 4. Update the task
curl -X PUT http://localhost:3000/tasks/<task-id> \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'

# 5. Delete the task
curl -X DELETE http://localhost:3000/tasks/<task-id>
```

## License

MIT

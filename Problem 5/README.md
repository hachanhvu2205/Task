# Task Manager CRUD API

A production-ready RESTful API for task management built with Node.js, Express, TypeScript, MongoDB, and Redis.

## 🚀 Features

### Core Functionality
- **Complete CRUD Operations**: Create, Read, Update, Delete tasks
- **Advanced Filtering**: Filter by status, priority, due date, tags
- **Search**: Full-text search in title and description
- **Pagination**: Configurable page size with metadata
- **Sorting**: Sort by any field in ascending/descending order

### Architecture & Best Practices
- **Controller-Service-Repository Pattern**: Clear separation of concerns
- **Input Validation**: Comprehensive validation with express-validator
- **Error Handling**: Centralized error handling with proper HTTP status codes (4xx vs 5xx)
- **TypeScript**: Full type safety throughout the codebase

### Infrastructure
- **MongoDB**: Primary database with Mongoose ODM
- **Redis**: Caching, rate limiting, session management
- **Docker**: Containerized deployment with docker-compose
- **Logging**: Winston logger with file rotation
- **Security**: Helmet.js, CORS, rate limiting

## 📁 Project Structure

```
crud-server/
├── src/
│   ├── api/v1/              # API routes (versioned)
│   │   ├── index.ts
│   │   └── task.routes.ts
│   ├── config/              # Configuration
│   │   └── index.ts
│   ├── controllers/         # HTTP request handlers
│   │   └── task.controller.ts
│   ├── middleware/          # Express middleware
│   │   ├── error.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   └── validation.middleware.ts
│   ├── models/              # Database models
│   │   └── task.model.ts
│   ├── repositories/        # Data access layer
│   │   └── task.repository.ts
│   ├── services/            # Business logic
│   │   ├── cache.service.ts
│   │   └── task.service.ts
│   ├── types/               # TypeScript interfaces
│   │   └── index.ts
│   ├── utils/               # Utilities
│   │   ├── errors.ts
│   │   ├── logger.ts
│   │   └── response.ts
│   ├── validators/          # Request validators
│   │   └── task.validator.ts
│   └── index.ts             # Application entry point
├── tests/                   # Test files
│   ├── setup.ts
│   └── task.test.ts
├── docs/                    # Documentation
├── logs/                    # Log files (auto-created)
├── docker-compose.yaml
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠 Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 20+ |
| Framework | Express.js 4.x |
| Language | TypeScript 5.x |
| Database | MongoDB 7.x with Mongoose |
| Cache | Redis 7.x with ioredis |
| Validation | express-validator |
| Logging | Winston |
| Testing | Jest + Supertest |
| Containerization | Docker + Docker Compose |

## 📋 API Endpoints

### Task Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/tasks` | List all tasks with filters |
| `POST` | `/api/v1/tasks` | Create a new task |
| `GET` | `/api/v1/tasks/:taskId` | Get task by ID |
| `PUT` | `/api/v1/tasks/:taskId` | Update task |
| `PATCH` | `/api/v1/tasks/:taskId` | Partial update task |
| `DELETE` | `/api/v1/tasks/:taskId` | Delete task |
| `GET` | `/api/v1/tasks/stats` | Get statistics |

### Health Checks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Basic health check |
| `GET` | `/ready` | Readiness check with service status |

### Query Parameters (GET /api/v1/tasks)

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `pending`, `in-progress`, `completed`, `cancelled` |
| `priority` | string | Filter by priority: `low`, `medium`, `high`, `urgent` |
| `search` | string | Search in title and description |
| `dueDate` | ISO8601 | Filter by exact due date |
| `dueBefore` | ISO8601 | Filter tasks due before date |
| `dueAfter` | ISO8601 | Filter tasks due after date |
| `tags` | string | Comma-separated tags |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (1-100, default: 10) |
| `sortBy` | string | Sort field: `createdAt`, `updatedAt`, `title`, `status`, `priority`, `dueDate` |
| `sortOrder` | string | Sort order: `asc`, `desc` |

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker and Docker Compose (recommended)
- MongoDB (if not using Docker)
- Redis (optional, for caching)

### Option 1: Docker (Recommended)

```bash
# Clone repository
git clone <repository-url>
cd crud-server

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

Services will be available at:
- API: http://localhost:3000
- MongoDB: localhost:27017
- Redis: localhost:6379
- Mongo Express (DB UI): http://localhost:8081

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your MongoDB URI
# MONGODB_URI=mongodb://localhost:27017/taskdb

# Start development server
npm run dev
```

### Option 3: Production Build

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## 🔧 Configuration

Environment variables (see `.env.example`):

```env
# Server
NODE_ENV=development
PORT=3000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/taskdb

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Cache TTL
CACHE_TTL=300  # 5 minutes

# Logging
LOG_LEVEL=info
```

## 📝 Usage Examples

### Create a Task

```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive README",
    "status": "pending",
    "priority": "high",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "tags": ["documentation", "urgent"]
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "title": "Complete project documentation",
    "description": "Write comprehensive README",
    "status": "pending",
    "priority": "high",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "tags": ["documentation", "urgent"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Task created successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### List Tasks with Filters

```bash
# Get pending high-priority tasks
curl "http://localhost:3000/api/v1/tasks?status=pending&priority=high&limit=10"

# Search tasks
curl "http://localhost:3000/api/v1/tasks?search=documentation"

# Get tasks due this week
curl "http://localhost:3000/api/v1/tasks?dueAfter=2024-01-15&dueBefore=2024-01-22"
```

### Update a Task

```bash
curl -X PUT http://localhost:3000/api/v1/tasks/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

### Delete a Task

```bash
curl -X DELETE http://localhost:3000/api/v1/tasks/507f1f77bcf86cd799439011
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm test -- --coverage
```

## 📊 Error Handling

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid request format |
| 404 | Not Found | Resource doesn't exist |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Validation failed",
    "details": [
      {
        "field": "title",
        "message": "Title is required",
        "value": null
      }
    ]
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🏗 Architecture

### Controller-Service-Repository Pattern

```
Request → Controller → Service → Repository → Database
                ↓
            Response
```

- **Controller**: Handles HTTP requests, validates input, returns responses
- **Service**: Contains business logic, caching, orchestration
- **Repository**: Data access layer, database operations

### Caching Strategy

- Individual tasks cached by ID
- List queries cached with filter hash
- Cache invalidation on create/update/delete
- Configurable TTL (default: 5 minutes)

### Rate Limiting

- In-memory rate limiter (default)
- Redis-based rate limiter (for distributed systems)
- Configurable window and max requests

## 🔐 Security

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Sanitize all inputs
- **Error Handling**: No sensitive data in errors

## 📈 Performance Optimization

- **Database Indexes**: Status, priority, dueDate, text search
- **Connection Pooling**: MongoDB connection reuse
- **Redis Caching**: Reduce database queries
- **Compression**: Gzip response compression
- **Lean Queries**: Use `.lean()` for read operations

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# Rebuild containers
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Remove volumes (data)
docker-compose down -v
```

## 📄 License

MIT

# INC TASK Backend API Documentation

## Overview

This is a Node.js Express TypeScript application with MongoDB integration for managing users and tasks.

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```
MONGODB_USERNAME=your_username
MONGODB_PASSWORD=your_password
MONGODB_DATABASE=inc_task_db
MONGODB_URI=mongodb://localhost:27017/inc_task_db
PORT=8000
```

## Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run start:ts` - Start server with ts-node

## API Endpoints

### User Endpoints

#### Create User

- **POST** `/api/users`
- **Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get All Users

- **GET** `/api/users?page=1&limit=10&search=john`
- **Query Parameters:**
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `search` (optional): Search by name or email

#### Get User by ID

- **GET** `/api/users/:id`

#### Update User

- **PUT** `/api/users/:id`
- **Body:**

```json
{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

#### Delete User

- **DELETE** `/api/users/:id`

#### Login User

- **POST** `/api/users/login`
- **Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Task Endpoints

#### Create Task

- **POST** `/api/tasks`
- **Body:**

```json
{
  "title": "Complete Project",
  "description": "Finish the backend API",
  "status": "pending",
  "priority": "high",
  "assignedTo": "60d5ecb74b24c72b8c8b4567",
  "dueDate": "2024-12-31T23:59:59.000Z",
  "createdBy": "60d5ecb74b24c72b8c8b4568"
}
```

#### Get All Tasks

- **GET** `/api/tasks?page=1&limit=10&status=pending&priority=high&assignedTo=60d5ecb74b24c72b8c8b4567&search=project`
- **Query Parameters:**
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `status` (optional): Filter by status (pending, in-progress, completed)
  - `priority` (optional): Filter by priority (low, medium, high)
  - `assignedTo` (optional): Filter by assigned user ID
  - `search` (optional): Search by title or description

#### Get Task by ID

- **GET** `/api/tasks/:id`

#### Update Task

- **PUT** `/api/tasks/:id`
- **Body:**

```json
{
  "title": "Updated Task Title",
  "status": "in-progress",
  "priority": "medium"
}
```

#### Delete Task

- **DELETE** `/api/tasks/:id`

#### Update Task Status

- **PATCH** `/api/tasks/:id/status`
- **Body:**

```json
{
  "status": "completed"
}
```

#### Get Tasks by User

- **GET** `/api/users/:userId/tasks?type=assigned&page=1&limit=10`
- **Query Parameters:**
  - `type` (optional): 'created' or 'assigned' (default: 'assigned')
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)

## Data Models

### User Schema

```typescript
{
  _id: ObjectId,
  name: string (required, 2-50 chars),
  email: string (required, unique, valid email),
  password: string (required, min 6 chars),
  createdAt: Date,
  updatedAt: Date
}
```

### Task Schema

```typescript
{
  _id: ObjectId,
  title: string (required, 3-100 chars),
  description: string (optional, max 500 chars),
  status: 'pending' | 'in-progress' | 'completed' (default: 'pending'),
  priority: 'low' | 'medium' | 'high' (default: 'medium'),
  assignedTo: ObjectId (optional, references User),
  dueDate: Date (optional),
  createdBy: ObjectId (required, references User),
  createdAt: Date,
  updatedAt: Date
}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...},
  "pagination": {...} // For paginated endpoints
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "error": {...}
}
```

## Legacy Endpoints (Backward Compatibility)

- **GET** `/testEndPoint` - Test endpoint
- **GET** `/getUserData` - Get hardcoded user data
- **GET** `/user/logIn` - Simple login check

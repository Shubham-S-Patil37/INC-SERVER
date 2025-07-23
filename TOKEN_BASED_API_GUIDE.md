# 🚀 Updated INC Task Management API Guide (Token-Based Authentication)

## 🔐 Key Changes

- **User ID removed from URLs** - Now extracted from JWT access tokens
- **Automatic audit tracking** - `createdBy`/`updatedBy` set from token
- **Enhanced security** - All protected routes require valid access tokens
- **Simplified API calls** - No need to manually pass user IDs

---

## 🔑 Authentication Flow

### 1. **User Registration**

```bash
curl -X POST http://localhost:8000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "permissions": ["Read", "Write"],
    "createdBy": 1
  }'
```

### 2. **User Login** (Get Tokens)

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "password123"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      /* user object */
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. **Verify Token & Get User Info**

```bash
curl -X GET http://localhost:8000/api/auth/verify-token \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 👤 User Profile Management (Token-Based)

### **Get My Profile**

```bash
curl -X GET http://localhost:8000/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### **Update My Profile**

```bash
curl -X PUT http://localhost:8000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "firstName": "John Updated",
    "lastName": "Doe Updated",
    "email": "john.updated@example.com"
  }'
```

_Note: `updatedBy` is automatically set from the access token_

### **Delete My Profile**

```bash
curl -X DELETE http://localhost:8000/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 🛡️ Admin User Management

### **Get All Users** (Admin only)

```bash
curl -X GET "http://localhost:8000/api/users?page=1&limit=10&search=john" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### **Get User by ID** (Admin)

```bash
curl -X GET http://localhost:8000/api/admin/users/USER_ID_HERE \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### **Update User by ID** (Admin)

```bash
curl -X PUT http://localhost:8000/api/admin/users/USER_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "firstName": "Admin Updated",
    "role": "admin",
    "permissions": ["Read", "Write", "Admin"]
  }'
```

### **Delete User by ID** (Admin)

```bash
curl -X DELETE http://localhost:8000/api/admin/users/USER_ID_HERE \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 📋 Task Management (Token-Based)

### **Create Task**

```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "title": "Complete Project Setup",
    "description": "Set up the development environment",
    "status": "pending",
    "priority": "high",
    "assignedTo": 2,
    "assignedToName": "Jane Smith",
    "dueDate": "2025-08-01T10:00:00Z"
  }'
```

**Auto-filled from token:**

- `createdBy` - Current user's ID
- `assignedBy` - Current user's ID (default)
- `assignedByName` - Current user's full name

### **Get My Tasks**

```bash
curl -X GET "http://localhost:8000/api/my-tasks?type=assigned&status=pending&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Query Parameters:**

- `type`: `"assigned"` (tasks assigned to me), `"assignedBy"` (tasks I created)
- `status`: `"pending"`, `"in-progress"`, `"completed"`
- `priority`: `"low"`, `"medium"`, `"high"`
- `page`, `limit`: pagination

### **Get All Tasks** (Admin view)

```bash
curl -X GET "http://localhost:8000/api/tasks?page=1&limit=10&status=pending&priority=high&search=project" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### **Get Task by ID**

```bash
curl -X GET http://localhost:8000/api/tasks/TASK_ID_HERE \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### **Update Task**

```bash
curl -X PUT http://localhost:8000/api/tasks/TASK_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "status": "in-progress",
    "description": "Updated task description",
    "priority": "high"
  }'
```

_Note: `updatedBy` is automatically set from the access token_

### **Delete Task**

```bash
curl -X DELETE http://localhost:8000/api/tasks/TASK_ID_HERE \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 🔄 Password Reset Flow (OTP)

### **Step 1: Request OTP**

```bash
curl -X POST http://localhost:8000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

### **Step 2: Verify OTP**

```bash
curl -X POST http://localhost:8000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

### **Step 3: Update Password**

```bash
curl -X POST http://localhost:8000/api/auth/update-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "newPassword": "newPassword123"
  }'
```

---

## 🔄 Token Management

### **Refresh Access Token**

```bash
curl -X POST http://localhost:8000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

---

## 🚀 Complete Testing Workflow

### **1. Authentication Setup**

```bash
# Login and save tokens
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"password123"}')

# Extract access token (you'll need jq or manually copy)
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.accessToken')
```

### **2. User Profile Operations**

```bash
# Get my profile
curl -X GET http://localhost:8000/api/users/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# Update my profile
curl -X PUT http://localhost:8000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{"firstName":"Updated","lastName":"Name"}'
```

### **3. Task Operations**

```bash
# Create a task
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "title":"Test Task",
    "description":"Testing token-based API",
    "priority":"medium",
    "assignedTo":1,
    "assignedToName":"Test User"
  }'

# Get my tasks
curl -X GET "http://localhost:8000/api/my-tasks?type=assigned" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

## 🔐 Security Features

### **Token Information**

- **Access Token**: 15-minute expiry, contains full user context
- **Refresh Token**: 7-day expiry, used only for token refresh
- **Automatic user context**: User ID extracted from token
- **Audit trail**: All operations track who performed them

### **Protected Routes**

All routes except authentication require `Authorization: Bearer TOKEN` header:

**Public Routes (No auth required):**

- `POST /api/users` (registration)
- `POST /api/auth/login`
- `POST /api/auth/refresh-token`
- `POST /api/auth/forgot-password`
- `POST /api/auth/verify-otp`
- `POST /api/auth/update-password`

**Protected Routes (Auth required):**

- All `/api/users/profile/*` routes
- All `/api/admin/*` routes
- All `/api/tasks/*` routes
- All `/api/my-tasks` routes
- `GET /api/auth/verify-token`

---

## 📊 Response Formats

### **Success Response**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    /* response data */
  }
}
```

### **Error Response**

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info (development only)"
}
```

### **Pagination Response**

```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [
    /* array of items */
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## ⚡ Quick Reference

### **Essential Headers**

```bash
-H "Content-Type: application/json"          # For POST/PUT requests
-H "Authorization: Bearer YOUR_TOKEN"        # For all protected routes
```

### **Common Query Parameters**

```bash
?page=1&limit=10                            # Pagination
?search=keyword                             # Search
?status=pending&priority=high               # Filters
```

This updated API guide reflects the new token-based authentication system where user IDs are automatically extracted from JWT tokens, providing better security and simpler API usage.

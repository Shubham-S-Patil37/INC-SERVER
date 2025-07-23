# 🚀 INC Task Management API Testing Guide

Complete API testing guide with curl commands for all authentication and CRUD operations.

## 📝 Environment Setup

Start the server:

```bash
npm run dev
# or
npm start
```

Server runs on: `http://localhost:8000`

---

## 🔐 Authentication APIs

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

### 2. **User Login** (Returns Access & Refresh Tokens)

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "password123"
  }'
```

**Response includes:**

- `accessToken` (15 minutes expiry) - Contains full user info
- `refreshToken` (7 days expiry) - For token refresh

### 3. **Refresh Access Token**

```bash
curl -X POST http://localhost:8000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN_HERE"
  }'
```

### 4. **Get User Info from Token**

```bash
curl -X GET http://localhost:8000/api/auth/user-info \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 🔄 Password Reset Flow (OTP-based)

### Step 1: **Request Password Reset OTP**

```bash
curl -X POST http://localhost:8000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

_Sends 6-digit OTP to user's email (valid for 10 minutes)_

### Step 2: **Verify OTP**

```bash
curl -X POST http://localhost:8000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

### Step 3: **Update Password**

```bash
curl -X POST http://localhost:8000/api/auth/update-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "newPassword": "newPassword123"
  }'
```

---

## 👥 User Management APIs

### **Get All Users** (with pagination)

```bash
curl -X GET "http://localhost:8000/api/users?page=1&limit=10&search=john" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### **Get User by ID**

```bash
curl -X GET http://localhost:8000/api/users/USER_ID_HERE \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### **Get User by Username**

```bash
curl -X GET http://localhost:8000/api/users/username/john_doe \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### **Get Users by Role**

```bash
curl -X GET "http://localhost:8000/api/users/role/admin?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### **Update User**

```bash
curl -X PUT http://localhost:8000/api/users/USER_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "firstName": "John Updated",
    "lastName": "Doe Updated",
    "role": "admin",
    "permissions": ["Read", "Write", "Admin"],
    "updatedBy": 1
  }'
```

### **Delete User**

```bash
curl -X DELETE http://localhost:8000/api/users/USER_ID_HERE \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 📋 Task Management APIs

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
    "assignedBy": 1,
    "assignedToName": "Jane Smith",
    "assignedByName": "John Doe",
    "createdBy": 1,
    "dueDate": "2025-08-01T10:00:00Z"
  }'
```

### **Get All Tasks** (with filters)

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
    "updatedBy": 1
  }'
```

### **Delete Task**

```bash
curl -X DELETE http://localhost:8000/api/tasks/TASK_ID_HERE \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 🔑 JWT Token Information

### **Access Token Contains:**

- User ID, username, email
- Role and permissions
- First name, last name
- Expires in 15 minutes
- Used for API authentication

### **Refresh Token Contains:**

- User ID only
- Expires in 7 days
- Used to get new access tokens

### **Token Usage:**

1. Login to get both tokens
2. Use access token for API calls
3. When access token expires, use refresh token to get new access token
4. Refresh tokens expire after 7 days (user must login again)

---

## 🎯 Testing Workflow

### **Complete Authentication Flow:**

```bash
# 1. Register user
curl -X POST http://localhost:8000/api/users -H "Content-Type: application/json" -d '{"username":"testuser","email":"test@example.com","password":"password123","firstName":"Test","lastName":"User","createdBy":1}'

# 2. Login
curl -X POST http://localhost:8000/api/auth/login -H "Content-Type: application/json" -d '{"username":"testuser","password":"password123"}'

# 3. Use access token for API calls
# Replace YOUR_ACCESS_TOKEN with token from login response
curl -X GET http://localhost:8000/api/auth/user-info -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 4. Refresh token when needed
curl -X POST http://localhost:8000/api/auth/refresh-token -H "Content-Type: application/json" -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

### **Password Reset Flow:**

```bash
# 1. Request OTP
curl -X POST http://localhost:8000/api/auth/forgot-password -H "Content-Type: application/json" -d '{"email":"test@example.com"}'

# 2. Check email for OTP, then verify
curl -X POST http://localhost:8000/api/auth/verify-otp -H "Content-Type: application/json" -d '{"email":"test@example.com","otp":"123456"}'

# 3. Update password
curl -X POST http://localhost:8000/api/auth/update-password -H "Content-Type: application/json" -d '{"email":"test@example.com","newPassword":"newPassword123"}'
```

---

## ⚙️ Environment Configuration

Make sure to update `.env` file with:

- Valid MongoDB connection
- Gmail app password for email functionality
- Strong JWT secrets (already configured)

---

## 📧 Email Setup for OTP

For Gmail setup:

1. Enable 2-factor authentication
2. Generate App Password
3. Update `EMAIL_PASS` in `.env` with the app password

---

## 🚨 Error Handling

All APIs return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (in development)"
}
```

## 🎉 Success Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

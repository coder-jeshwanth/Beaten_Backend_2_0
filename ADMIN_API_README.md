# Admin API Documentation

This document describes the admin authentication and management endpoints for the Beaten backend API.

## Base URL

```
http://localhost:5000/api/admin
```

## Authentication

All admin endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### 1. Admin Registration

**POST** `/register`

Register a new admin user (should be restricted in production).

**Request Body:**

```json
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "AdminPass123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Admin registered successfully",
  "data": {
    "_id": "admin_id",
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "admin",
    "permissions": {
      "users": { "view": true, "create": true, "edit": true, "delete": true },
      "products": {
        "view": true,
        "create": true,
        "edit": true,
        "delete": true
      },
      "orders": { "view": true, "edit": true, "delete": false },
      "analytics": { "view": true }
    },
    "token": "jwt_token"
  }
}
```

### 2. Admin Login

**POST** `/login`

Authenticate admin and get access token.

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "AdminPass123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Admin logged in successfully",
  "data": {
    "_id": "admin_id",
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "admin",
    "permissions": { ... },
    "lastLogin": "2024-01-01T00:00:00.000Z",
    "token": "jwt_token"
  }
}
```

### 3. Get Admin Profile

**GET** `/profile`

Get current admin profile (requires authentication).

**Response:**

```json
{
  "success": true,
  "message": "Admin profile retrieved successfully",
  "data": {
    "_id": "admin_id",
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "admin",
    "permissions": { ... },
    "isActive": true,
    "emailVerified": true,
    "lastLogin": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Update Admin Profile

**PUT** `/profile`

Update admin profile (requires authentication).

**Request Body:**

```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Admin profile updated successfully",
  "data": {
    "_id": "admin_id",
    "name": "Updated Name",
    "email": "updated@example.com",
    "role": "admin",
    "permissions": { ... },
    "isActive": true,
    "emailVerified": true,
    "lastLogin": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. Change Admin Password

**PUT** `/change-password`

Change admin password (requires authentication).

**Request Body:**

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### 6. Admin Logout

**POST** `/logout`

Logout admin (requires authentication).

**Response:**

```json
{
  "success": true,
  "message": "Admin logged out successfully"
}
```

## Admin Role

### Admin

- Full admin privileges
- Can manage users, products, orders
- Can access all admin endpoints

## Permissions Structure

Each admin has a permissions object with the following structure:

```json
{
  "users": {
    "view": true,
    "create": true,
    "edit": true,
    "delete": true
  },
  "products": {
    "view": true,
    "create": true,
    "edit": true,
    "delete": true
  },
  "orders": {
    "view": true,
    "edit": true,
    "delete": false
  },
  "analytics": {
    "view": true
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email"
    }
  ]
}
```

## Setup

1. Create an admin user:

```bash
npm run create-admin
```

2. Default admin credentials:
   - Email: admin@beaten.com
   - Password: Admin123!

## Security Notes

- Admin registration should be disabled in production
- Use strong passwords (minimum 8 characters with uppercase, lowercase, number, and special character)
- Tokens expire based on JWT_EXPIRE environment variable
- Admin accounts can be deactivated by setting isActive to false

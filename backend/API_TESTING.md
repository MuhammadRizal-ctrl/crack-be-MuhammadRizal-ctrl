# API Testing Guide

This document provides examples for testing all API endpoints using curl, Postman, or any HTTP client.

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## Test Credentials

After seeding the database, use these credentials:

- **Student**: `student@example.com` / `password123`
- **Instructor**: `instructor@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`

---

## Authentication Endpoints

### 1. Register User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "fullName": "New User",
    "role": "student"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "fullName": "John Student",
    "role": "student",
    "avatar": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Get Current User

```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <token>"
```

### 4. Refresh Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refresh-token>"
  }'
```

---

## Users Endpoints

### 1. List All Users (Admin Only)

```bash
curl -X GET "http://localhost:3000/api/v1/users?page=1&limit=10" \
  -H "Authorization: Bearer <admin-token>"
```

### 2. Get User Profile

```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer <token>"
```

### 3. Update Profile

```bash
curl -X PATCH http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Updated Name",
    "bio": "Updated bio"
  }'
```

### 4. Get User by ID (Admin Only)

```bash
curl -X GET http://localhost:3000/api/v1/users/<user-id> \
  -H "Authorization: Bearer <admin-token>"
```

---

## Courses Endpoints

### 1. List Courses

```bash
curl -X GET "http://localhost:3000/api/v1/courses?page=1&limit=10&difficulty=beginner" \
  -H "Authorization: Bearer <token>"
```

### 2. Get Course Details

```bash
curl -X GET http://localhost:3000/api/v1/courses/<course-id> \
  -H "Authorization: Bearer <token>"
```

### 3. Create Course (Instructor/Admin)

```bash
curl -X POST http://localhost:3000/api/v1/courses \
  -H "Authorization: Bearer <instructor-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Course",
    "description": "Course description",
    "difficulty": "beginner",
    "category": "Web Development",
    "duration": 20,
    "status": "published"
  }'
```

### 4. Update Course

```bash
curl -X PATCH http://localhost:3000/api/v1/courses/<course-id> \
  -H "Authorization: Bearer <instructor-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title"
  }'
```

### 5. Enroll in Course (Student)

```bash
curl -X POST http://localhost:3000/api/v1/courses/<course-id>/enroll \
  -H "Authorization: Bearer <student-token>"
```

### 6. Get Course Progress (Student)

```bash
curl -X GET http://localhost:3000/api/v1/courses/<course-id>/progress \
  -H "Authorization: Bearer <student-token>"
```

---

## Challenges Endpoints

### 1. List Challenges

```bash
curl -X GET "http://localhost:3000/api/v1/challenges?page=1&limit=10&difficulty=easy" \
  -H "Authorization: Bearer <token>"
```

### 2. Get Challenge Details

```bash
curl -X GET http://localhost:3000/api/v1/challenges/<challenge-id> \
  -H "Authorization: Bearer <token>"
```

### 3. Create Challenge (Instructor/Admin)

```bash
curl -X POST http://localhost:3000/api/v1/challenges \
  -H "Authorization: Bearer <instructor-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Reverse String",
    "description": "Reverse a given string",
    "difficulty": "easy",
    "language": "javascript",
    "solution": "function reverse(str) { return str.split(\"\").reverse().join(\"\"); }",
    "testCases": [
      {
        "input": "\"hello\"",
        "expectedOutput": "\"olleh\"",
        "isPublic": true
      }
    ],
    "tags": ["strings", "algorithms"]
  }'
```

### 4. Submit Challenge (Student)

```bash
curl -X POST http://localhost:3000/api/v1/challenges/<challenge-id>/submit \
  -H "Authorization: Bearer <student-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function reverse(str) { return str.split(\"\").reverse().join(\"\"); }",
    "language": "javascript"
  }'
```

### 5. Get Submissions

```bash
curl -X GET http://localhost:3000/api/v1/challenges/<challenge-id>/submissions \
  -H "Authorization: Bearer <token>"
```

### 6. Get Leaderboard

```bash
curl -X GET http://localhost:3000/api/v1/challenges/<challenge-id>/leaderboard \
  -H "Authorization: Bearer <token>"
```

---

## Roadmaps Endpoints

### 1. List Roadmaps

```bash
curl -X GET "http://localhost:3000/api/v1/roadmaps?page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### 2. Get Roadmap Details

```bash
curl -X GET http://localhost:3000/api/v1/roadmaps/<roadmap-id> \
  -H "Authorization: Bearer <token>"
```

### 3. Create Roadmap (Instructor/Admin)

```bash
curl -X POST http://localhost:3000/api/v1/roadmaps \
  -H "Authorization: Bearer <instructor-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Frontend Developer Roadmap",
    "description": "Complete path to frontend development",
    "category": "Frontend",
    "items": [
      {
        "id": "item1",
        "title": "HTML Basics",
        "type": "milestone",
        "order": 1
      }
    ],
    "isPublished": true
  }'
```

### 4. Enroll in Roadmap (Student)

```bash
curl -X POST http://localhost:3000/api/v1/roadmaps/<roadmap-id>/enroll \
  -H "Authorization: Bearer <student-token>"
```

### 5. Get Roadmap Progress (Student)

```bash
curl -X GET http://localhost:3000/api/v1/roadmaps/<roadmap-id>/progress \
  -H "Authorization: Bearer <student-token>"
```

### 6. Complete Roadmap Item (Student)

```bash
curl -X POST http://localhost:3000/api/v1/roadmaps/<roadmap-id>/items/<item-id>/complete \
  -H "Authorization: Bearer <student-token>"
```

---

## AI Tutor Endpoints

### 1. Send Message

```bash
curl -X POST http://localhost:3000/api/v1/tutor/chat \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is React?",
    "personality": "teacher"
  }'
```

### 2. Get Conversation History

```bash
curl -X GET http://localhost:3000/api/v1/tutor/history \
  -H "Authorization: Bearer <token>"
```

### 3. Get Conversation by ID

```bash
curl -X GET http://localhost:3000/api/v1/tutor/conversations/<conversation-id> \
  -H "Authorization: Bearer <token>"
```

### 4. Delete Conversation

```bash
curl -X DELETE http://localhost:3000/api/v1/tutor/conversations/<conversation-id> \
  -H "Authorization: Bearer <token>"
```

---

## Testing with Postman

1. **Import Collection**: Create a new collection in Postman
2. **Set Environment Variables**:
   - `base_url`: `http://localhost:3000/api/v1`
   - `token`: (set after login)
3. **Create Requests**: Use the curl examples above as reference

## Testing Checklist

- [ ] Register new user
- [ ] Login with credentials
- [ ] Get current user profile
- [ ] List courses
- [ ] Get course details
- [ ] Create course (as instructor)
- [ ] Enroll in course (as student)
- [ ] List challenges
- [ ] Submit challenge solution
- [ ] Create roadmap (as instructor)
- [ ] Enroll in roadmap (as student)
- [ ] Send message to AI tutor
- [ ] Get conversation history

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "timestamp": "2024-01-20T10:00:00.000Z",
  "path": "/api/v1/courses",
  "message": "Error message here"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error


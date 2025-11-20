# API Reference

## Base URL
```
http://localhost:8000
```

## Authentication
All endpoints except auth and public endpoints require a Bearer token:
```
Authorization: Bearer <jwt_token>
```

Demo accounts are available for quick testing (or run the seeding script to create them):

- Teacher: `teacher@school.com` / `password123`
- Student: `student@school.com` / `password123`

To create demo users in the database run:

```bash
cd backend
python seed_demo.py
```

---

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "full_name": "John Doe",
  "password": "securepassword123",
  "role": "student"  // or "teacher"
}
```

**Response (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "student",
    "created_at": "2024-01-15T10:30:00"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):** Same as Register

**Error (401):**
```json
{
  "detail": "Invalid email or password"
}
```

---

## Student Management Endpoints (Teachers Only)

### Create Student
```http
POST /api/students
Authorization: Bearer <token>
Content-Type: application/json

{
  "student_id": "STU001",
  "name": "Alice Johnson",
  "email": "alice@school.com",
  "class_name": "Grade 10-A"
}
```

**Response (200):**
```json
{
  "id": 5,
  "student_id": "STU001",
  "name": "Alice Johnson",
  "email": "alice@school.com",
  "class_name": "Grade 10-A",
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

### Get All Students
```http
GET /api/students
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "student_id": "STU001",
    "name": "Alice Johnson",
    ...
  },
  ...
]
```

### Get Student
```http
GET /api/students/{student_id}
Authorization: Bearer <token>
```

### Update Student
```http
PUT /api/students/{student_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Alice J. Johnson",
  "class_name": "Grade 10-B"
}
```

### Delete Student
```http
DELETE /api/students/{student_id}
Authorization: Bearer <token>
```

---

## Prediction Endpoints

### Create Prediction

```http
POST /api/predictions
Authorization: Bearer <token>
Content-Type: application/json

{
  "study_hours": 5.5,
  "attendance": 92,
  "assignments_score": 85,
  "past_marks": 78,
  "engagement_score": 8,
  "student_id": 5  // Optional, for teachers only
}
```

**Response (200):**
```json
{
  "id": 15,
  "predicted_score": 82.45,
  "pass_fail": "Pass",
  "risk_category": "Low",
  "confidence": 0.94,
  "study_hours": 5.5,
  "attendance": 92,
  "assignments_score": 85,
  "past_marks": 78,
  "engagement_score": 8,
  "created_at": "2024-01-15T14:22:00"
}
```

**Error (400) - Invalid Input:**
```json
{
  "detail": "attendance must be between 0 and 100, got 105"
}
```

### Get My Predictions (Student/Teacher)
```http
GET /api/predictions/my?limit=10
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 15,
    "predicted_score": 82.45,
    "pass_fail": "Pass",
    "risk_category": "Low",
    "confidence": 0.94,
    "study_hours": 5.5,
    "attendance": 92,
    "assignments_score": 85,
    "past_marks": 78,
    "engagement_score": 8,
    "created_at": "2024-01-15T14:22:00"
  },
  ...
]
```

### Get Latest Prediction
```http
GET /api/predictions/my/latest
Authorization: Bearer <token>
```

**Response (200):** Single prediction object (same as above)

### Get Student Predictions (Teachers Only)
```http
GET /api/predictions/student/{student_id}?limit=10
Authorization: Bearer <token>
```

### Get Class Analytics (Teachers Only)
```http
GET /api/predictions/class/analytics
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "total_students": 30,
  "total_predictions": 28,
  "average_score": 74.35,
  "risk_distribution": {
    "low_risk": 12,
    "medium_risk": 10,
    "high_risk": 6
  },
  "pass_rate": 73.33
}
```

### Get Class Students Overview (Teachers Only)
```http
GET /api/predictions/class/students-overview
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "student_id": "STU001",
    "name": "Alice Johnson",
    "email": "alice@school.com",
    "class_name": "Grade 10-A",
    "created_at": "2024-01-15T10:30:00",
    "updated_at": "2024-01-15T10:30:00",
    "latest_prediction": {
      "id": 15,
      "predicted_score": 82.45,
      "pass_fail": "Pass",
      "risk_category": "Low",
      "confidence": 0.94,
      ...
    }
  },
  ...
]
```

---

## Info Endpoints

### Get Model Information
```http
GET /api/info/model
```

**Response (200):**
```json
{
  "algorithm": "Random Forest Ensemble",
  "features": [
    "study_hours",
    "attendance",
    "assignments_score",
    "past_marks",
    "engagement_score"
  ],
  "n_estimators": 100,
  "max_depth": 15,
  "feature_importance": [
    {
      "feature": "past_marks",
      "importance": 0.28
    },
    ...
  ],
  "performance": {
    "regression": {
      "rmse": 5.23,
      "r2_score": 0.87,
      "mse": 27.35
    },
    "classification": {
      "accuracy": 0.92
    }
  },
  "risk_thresholds": {
    "low_risk": 75,
    "medium_risk": 60,
    "high_risk": 0
  },
  "version": "1.0",
  "training_date": "2024-01-15T09:00:00"
}
```

### Health Check
```http
GET /api/health
```

**Response (200):**
```json
{
  "status": "ok"
}
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "detail": "Invalid input data"
}
```

### 401 - Unauthorized
```json
{
  "detail": "Invalid authentication credentials"
}
```

### 403 - Forbidden
```json
{
  "detail": "Only teachers can access this resource"
}
```

### 404 - Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 - Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Input Validation Rules

| Field | Range | Notes |
|-------|-------|-------|
| study_hours | 0-24 | Hours per day |
| attendance | 0-100 | Percentage |
| assignments_score | 0-100 | Numeric score |
| past_marks | 0-100 | Numeric score |
| engagement_score | 0-10 | Rating scale |
| password | 8+ chars | Min 8 characters |
| email | Valid email | Format validation |

---

## Rate Limiting
Currently not implemented. Consider adding in production:
- 100 requests per minute per IP
- 1000 requests per day per user

---

## WebSocket (Future Enhancement)
Potential for real-time prediction updates:
```javascript
ws://localhost:8000/ws/predictions/{student_id}
```

---

## Testing the API

### Using cURL
```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@school.com",
    "full_name": "Test User",
    "password": "testpass123",
    "role": "student"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@school.com",
    "password": "testpass123"
  }'

# Create Prediction (with token)
curl -X POST http://localhost:8000/api/predictions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "study_hours": 5,
    "attendance": 90,
    "assignments_score": 85,
    "past_marks": 75,
    "engagement_score": 8
  }'
```

### Using Postman
1. Import the API endpoints
2. Set up Bearer token authentication
3. Test each endpoint with sample data

### Interactive Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

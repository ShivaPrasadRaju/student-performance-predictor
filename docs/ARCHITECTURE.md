# Architecture Overview

## System Design

The Student Performance Predictor is a full-stack application with three main layers:

```
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND (React + Vite)                │
│  - TypeScript for type safety                           │
│  - Tailwind CSS for responsive UI                       │
│  - Role-based dashboards (Student/Teacher)             │
│  - Recharts for data visualization                      │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/REST API
                       │
┌──────────────────────┴──────────────────────────────────┐
│              BACKEND API (FastAPI + Python)              │
│  - JWT authentication & authorization                   │
│  - SQLAlchemy ORM for database operations               │
│  - RESTful API endpoints                                │
│  - Request validation with Pydantic                     │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│          DATABASE & ML LAYER                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │  SQLite/PostgreSQL Database                      │  │
│  │  - Users, Students, Predictions tables           │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ML Model (scikit-learn)                         │  │
│  │  - Random Forest for predictions                 │  │
│  │  - Feature scaling pipeline                      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
App (Root Router)
├── AuthProvider (Context)
├── Navbar
└── Routes
    ├── LandingPage (public)
    ├── LoginPage (public)
    ├── RegisterPage (public)
    ├── AboutPage (public)
    ├── StudentDashboard (protected - student only)
    └── TeacherDashboard (protected - teacher only)
```

### Backend Structure

```
app/
├── main.py              # FastAPI application entry
├── config.py            # Configuration management
├── database.py          # Database setup & session
├── middleware.py        # Authentication middleware
├── models/
│   └── __init__.py      # SQLAlchemy ORM models
│       - User
│       - Student
│       - Prediction
├── schemas/
│   └── __init__.py      # Pydantic validation schemas
├── services/
│   ├── __init__.py      # Business logic
│   └── security.py      # JWT & password utilities
└── api/
    ├── auth.py          # Authentication endpoints
    ├── students.py      # Student management endpoints
    ├── predictions.py   # Prediction endpoints
    └── info.py          # Info endpoints
```

### ML Model Pipeline

```
Training:
1. Load dataset (CSV) → 200 students
2. Feature engineering (5 input features)
3. Train/test split (80/20)
4. Fit StandardScaler
5. Train Random Forest (100 trees)
6. Save model & scaler as pickle

Inference:
1. Receive feature data
2. Validate input ranges
3. Scale features using fitted scaler
4. Make prediction using model
5. Derive risk category from score
6. Return result with confidence
```

## Database Schema

```
users (id, email, full_name, hashed_password, role, is_active, created_at)
  ↓
students (id, student_id, name, email, class_name, teacher_id, created_at, updated_at)
  ↓
predictions (id, user_id, student_id, study_hours, attendance, assignments_score, 
             past_marks, engagement_score, predicted_score, pass_fail, 
             risk_category, confidence, created_at)
```

## Data Flow

### Login/Registration Flow
```
User Registration
└─ POST /api/auth/register
   ├─ Validate input (email, password, role)
   ├─ Hash password with bcrypt
   ├─ Create user in database
   ├─ Generate JWT token
   └─ Return token + user info

User Login
└─ POST /api/auth/login
   ├─ Verify email & password
   ├─ Authenticate against database
   ├─ Generate JWT token
   └─ Return token + user info
```

### Prediction Flow (Student)
```
Student Creates Prediction
└─ POST /api/predictions
   ├─ Extract JWT & verify user is student
   ├─ Validate input features (5 fields)
   ├─ Call ML model.predict()
   ├─ Store prediction in database
   ├─ Return result to frontend
   └─ Frontend displays score + visualizations
```

### Prediction Flow (Teacher)
```
Teacher Creates Prediction for Student
└─ POST /api/predictions
   ├─ Extract JWT & verify user is teacher
   ├─ Verify student belongs to teacher's class
   ├─ Validate input features
   ├─ Call ML model.predict()
   ├─ Store prediction linked to student
   └─ Update class analytics cache
```

### Class Analytics Flow
```
Teacher Requests Analytics
└─ GET /api/predictions/class/analytics
   ├─ Get all students for teacher
   ├─ Fetch latest prediction for each
   ├─ Calculate statistics
   │  ├─ Average score
   │  ├─ Pass rate %
   │  └─ Risk distribution counts
   └─ Return analytics object
```

## Authentication Flow

1. **JWT Token Generation**
   - On login/register: Create token with user_id & role in payload
   - Token expires after 30 minutes (configurable)
   - Stored in localStorage on frontend

2. **Request Authentication**
   - Frontend includes: `Authorization: Bearer <token>`
   - Backend validates token signature & expiration
   - Middleware extracts user_id and role
   - Routes verify role permissions

3. **Role-Based Access Control**
   - Student routes: Only access own data
   - Teacher routes: Access students in their class
   - Admin routes: (Future expansion)

## Deployment Architecture

### Development
- Frontend: `npm run dev` (Vite dev server on :5173)
- Backend: `python run.py` (Uvicorn on :8000)
- Database: SQLite (local file)

### Production
- Frontend: Build static bundle, serve via CDN/nginx
- Backend: Deploy to cloud (AWS/Azure/Heroku)
- Database: PostgreSQL in managed database service
- ML Model: Loaded in memory, can be versioned/cached

## Performance Considerations

1. **Caching**
   - Student predictions cached in localStorage
   - Teacher analytics could use Redis for class stats

2. **Database Queries**
   - Indexed on: user_id, student_id, created_at
   - Pagination for large datasets

3. **ML Model**
   - Loaded once at startup
   - Inference typically <100ms per prediction
   - Batch predictions possible for teacher bulk operations

4. **API Response Size**
   - Paginated prediction history (10 per page default)
   - Filtered student lists (by risk category)
   - Analytics pre-computed server-side

## Security Measures

1. **Password Security**
   - Bcrypt hashing with salt
   - Minimum 8 characters required
   - Hashes never stored in plain text

2. **API Security**
   - JWT tokens for stateless auth
   - CORS enabled for frontend origin only
   - HTTPS required in production

3. **Data Protection**
   - Students can only access own data
   - Teachers can only access their students
   - SQL injection prevented via ORM
   - CSRF tokens (can be added with middleware)

4. **Model Security**
   - Model file not exposed via API
   - Predictions validated before storage
   - Input ranges checked (no negative values, etc.)

## Error Handling

- Frontend: Try-catch with user-friendly error messages
- Backend: Pydantic validation + HTTPException
- Logging: Structured logs for debugging
- Monitoring: Error tracking (optional - NewRelic/Sentry)

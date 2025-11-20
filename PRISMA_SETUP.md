# Prisma Setup Guide

This backend now uses **Prisma ORM with Python** (`prisma-client-py`) instead of SQLAlchemy. Here's what changed:

## ✅ What Was Done

### 1. **Prisma Schema Created** (`prisma/schema.prisma`)
   - Defined all database models: `User`, `Student`, `Section`, `Prediction`
   - Models use SQLite for development (easily switchable to PostgreSQL)
   - Includes proper relationships and indexes

### 2. **Database Initialized**
   - Created SQLite database: `backend/dev.db`
   - Generated Prisma client: `prisma-client-py v0.15.0`
   - Migration file: `prisma/migrations/20251119181717_init`

### 3. **Python Backend Migrated**
   - Updated `app/database.py` → Prisma async client
   - Updated `app/services/__init__.py` → All async Prisma queries
   - Updated `app/api/auth.py` → Async Prisma authentication
   - Updated `app/main.py` → Async lifespan management

### 4. **Dependencies Installed**
    - `prisma==0.15.0` (Python client)
    - `@prisma/cli` (Node.js for migrations - optional)
    - Database setup ready for PostgreSQL (recommended)

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+ (for Prisma CLI)
- PostgreSQL (optional, for production)

### Setup Development Environment

```bash
# Navigate to backend
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Generate Prisma client
python -m prisma generate

# Apply Prisma schema to the database (quick sync)
# For Postgres or SQLite when you want to sync schema without creating a migration
python -m prisma db push

# Generate/Regenerate Prisma client (run after migrations or schema changes)
python -m prisma generate

# Run backend (development)
# Use the project's Python interpreter so imports and venv are correct
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 📦 Using Prisma in Your Code

### Example: Create User
```python
from app.database import prisma
from app.services import UserService

# In an async route:
user = await UserService.create_user(prisma, user_data)
```

### Example: Query Students
```python
students = await prisma.student.find_many(
    where={"teacherId": teacher_id},
    order={"createdAt": "desc"}
)
```

### Example: Update Record
```python
updated = await prisma.section.update(
    where={"id": section_id},
    data={"name": "New Name"}
)
```

## 🔄 Switching to PostgreSQL

1. **Update `.env`**:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/student_predictor
```

2. **Update schema** in `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. **Reset and migrate**:
```bash
# For Postgres (will drop data in dev):
python -m prisma migrate reset
# OR create and apply a migration in development:
python -m prisma migrate dev --name migration_name
```

4. **Apply schema without creating a migration (quick sync)**
```bash
# Useful during development when schema drift is small
python -m prisma db push
```

## 📝 Working with Migrations

### Create New Migration
```bash
# After modifying prisma/schema.prisma:
python -m prisma migrate dev --name description_of_change
```

### Apply Pending Migrations
```bash
python -m prisma migrate deploy
```

### Reset Database (dev only)
```bash
python -m prisma migrate reset
```

### View Database in Prisma Studio
```bash
python -m prisma studio
```

## 📋 Prisma Schema Overview

All models use camelCase for Prisma (snake_case mapping in database):

| Model | Fields | Key Relations |
|-------|--------|---|
| **User** | id, email, fullName, role, isActive | Has many: students, sections, predictions |
| **Student** | id, studentId, name, email, year, section | Belongs to: teacher, section; Has many: predictions |
| **Section** | id, name, year, teacherId | Belongs to: teacher; Has many: students |
| **Prediction** | id, userId, studentId, study_hours, attendance, ... | Belongs to: user, student |

## 🔧 Troubleshooting

### "Prisma client not generated"
```bash
python -m prisma generate
```

### Database locked (SQLite)
```bash
rm backend/dev.db
python -m prisma migrate reset
```

### Connection refused (PostgreSQL)
Ensure PostgreSQL is running and `.env` has correct credentials

### Async/await errors
All Prisma operations are **async** - use `async def` and `await`:
```python
async def my_route():
    result = await prisma.user.find_unique(where={"id": 1})
```

## 📚 Resources

- [Prisma Python Docs](https://prisma-client-py.readthedocs.io/)
- [Prisma Schema Reference](https://pris.ly/d/prisma-schema)
- [Prisma Migrations](https://pris.ly/d/prisma-migrate)

## ✨ Next Steps

1. Update remaining routes (`students.py`, `predictions.py`, `sections.py`, `info.py`) to use Prisma
2. Add async endpoints to all API routes
3. Test all CRUD operations
4. Set up PostgreSQL for production

# Setup & Installation Guide

## Prerequisites

- **Node.js** 16+ ([download](https://nodejs.org/))
- **Python** 3.9+ ([download](https://www.python.org/))
- **Git** for version control
- **npm** (comes with Node.js)

## Project Structure

```
student-performance-predictor/
├── frontend/                 # React + Vite application
├── backend/                  # FastAPI Python server
├── model/                    # ML training & inference
├── dataset/                  # Sample training data
├── docs/                     # Documentation
├── agile/                    # Project management
└── README.md                 # Main readme
```

## Backend Setup (Python)

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Create Environment File
```bash
# Copy example env file
cp .env.example .env

# Edit .env with your settings (optional for development)
```

### 5. Initialize Database
The database will be created automatically on first run.

### 6. Train ML Model (Optional)
```bash
cd ../model
python train.py
cd ../backend
```

This generates:
- `model_pipeline.pkl` - Trained models
- `scaler.pkl` - Feature scaler
- `model_info.json` - Model metadata

### 7. Run Backend Server
```bash
python run.py
```

The server will start on `http://localhost:8000`

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

### 8. Access Backend Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

---

## Frontend Setup (React)

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

This installs:
- React 18
- React Router for navigation
- Axios for API calls
- Recharts for data visualization
- Tailwind CSS for styling
- TypeScript support

### 3. Configure API URL (Optional)
Create `.env.local` if backend is on different port:
```bash
VITE_API_URL=http://localhost:8000
```

Default is `http://localhost:8000`

### 4. Run Development Server
```bash
npm run dev
```

The application will open at `http://localhost:5173`

**Expected output:**
```
VITE v5.0.8  ready in 234 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### 5. Build for Production
```bash
npm run build
```

Generates optimized bundle in `dist/` folder

---

## Complete Startup (from root directory)

### Terminal 1 - Backend
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python run.py
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm run dev
```

### Terminal 3 - (Optional) Train Model
```bash
cd model
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install scikit-learn pandas numpy
python train.py
```

---

## Database

### SQLite (Development)
- File: `student_predictor.db` (created automatically)
- Location: `backend/` directory
- Easy setup, no server needed

### PostgreSQL (Production)
Update `DATABASE_URL` in `.env`:
```
DATABASE_URL=postgresql://user:password@localhost/student_db
```

Then install PostgreSQL driver:
```bash
pip install psycopg2-binary
```

---

## Default Test Credentials

After starting the application:

### Teacher Account
- Email: `teacher@school.com`
- Password: `password123`
- Role: Teacher

### Student Account
- Email: `student@school.com`
- Password: `password123`
- Role: Student

These are demo accounts for testing. Create new accounts via registration.

---

## Troubleshooting

### Backend Issues

#### Port 8000 Already in Use
```bash
# Find process using port 8000
# Windows
netstat -ano | findstr :8000

# macOS/Linux
lsof -i :8000

# Kill the process and restart
```

#### Module Not Found Error
```bash
# Ensure virtual environment is activated
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

#### Database Lock Error
```bash
# Remove old database file
rm student_predictor.db

# Restart backend
python run.py
```

#### Model Not Found Error
```bash
# Train the model
cd model
python train.py

# Verify files created
ls -la *.pkl *.json
```

### Frontend Issues

#### npm Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try again
npm run dev
```

#### Port 5173 Already in Use
```bash
# Find and kill process
# Windows
netstat -ano | findstr :5173

# macOS/Linux
lsof -i :5173

# Or use different port
npm run dev -- --port 5174
```

#### Axios 401 Unauthorized
- Ensure backend is running on `:8000`
- Verify token is stored in localStorage
- Check JWT expiration (30 minutes)
- Login again to refresh token

#### Tailwind Styles Not Applying
```bash
# Rebuild CSS
npm run build

# Or in dev mode
npm run dev
```

### API Connection Issues

#### Cannot Connect to Backend
```bash
# Check if backend is running
curl http://localhost:8000/api/health

# Should return:
# {"status":"ok"}

# If error, check:
# 1. Backend process is running
# 2. Port 8000 is not blocked by firewall
# 3. No CORS issues in browser console
```

#### CORS Error
If you see CORS error:
- Ensure frontend URL is in `ALLOWED_ORIGINS` in `backend/app/config.py`
- Add your frontend port: `"http://localhost:5173"`
- Restart backend

---

## Environment Variables

### Backend (.env)
```bash
# Database
DATABASE_URL=sqlite:///./student_predictor.db

# JWT Settings
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Debug
DEBUG=True
```

### Frontend (.env.local)
```bash
# API URL
VITE_API_URL=http://localhost:8000
```

---

## Development Workflow

### 1. Start Services
```bash
# Terminal 1: Backend
cd backend && python run.py

# Terminal 2: Frontend
cd frontend && npm run dev
```

### 2. Make Changes
- Backend: Edit files in `backend/app/`
- Frontend: Edit files in `frontend/src/`
- Model: Edit `model/train.py` and run training

### 3. Automatic Reloading
- Backend: Uvicorn auto-reloads on file changes (if `reload=True`)
- Frontend: Vite HMR auto-refreshes on file changes

### 4. Testing Changes
- Browser: http://localhost:5173
- API Docs: http://localhost:8000/docs

---

## Production Deployment

### Backend Deployment

1. **Build Docker Image** (optional)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "run.py"]
```

2. **Deploy to Cloud**
   - Heroku, AWS EC2, Azure App Service, Google Cloud Run
   - Use PostgreSQL for database
   - Set `DEBUG=False`
   - Update `SECRET_KEY` and `ALLOWED_ORIGINS`

### Frontend Deployment

1. **Build Static Files**
```bash
npm run build
```

2. **Deploy to CDN**
   - Netlify (via GitHub)
   - Vercel
   - AWS S3 + CloudFront
   - GitHub Pages

3. **Update API URL**
```bash
VITE_API_URL=https://api.example.com
npm run build
```

### Database Deployment
- Use managed PostgreSQL service
- Enable automatic backups
- Set up monitoring and alerts

---

## Performance Optimization

### Frontend
```bash
# Analyze bundle size
npm run build -- --analyze

# Lazy load routes
# Already implemented in App.tsx with React.lazy()
```

### Backend
```bash
# Use production server
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app

# Enable query caching
# Use Redis for predictions cache
```

---

## Monitoring & Logging

### Backend Logs
```bash
# Enable detailed logging
export LOG_LEVEL=DEBUG
python run.py
```

### Frontend Errors
- Check browser console (F12)
- Check network tab for API errors
- Enable verbose logging in `services/api.ts`

---

## Next Steps

1. ✅ Complete the setup above
2. ✅ Create test accounts
3. ✅ Try student & teacher dashboards
4. ✅ View API documentation at `/docs`
5. ✅ Review architecture in `docs/ARCHITECTURE.md`
6. ✅ Read user stories in `agile/USER_STORIES.md`

---

## Support

For issues:
1. Check this troubleshooting section
2. Review error logs
3. Check GitHub issues
4. Consult project documentation in `/docs`

Enjoy using the Student Performance Predictor! 🎓

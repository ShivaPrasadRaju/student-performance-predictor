# Student Performance Predictor – Teacher & Student Dashboards

A modern, production-ready full-stack ML web application that predicts student academic performance with separate, role-based dashboards for teachers and students.

## 🎯 Features

### Student Features
- ✅ View personal predicted performance score
- ✅ Check pass/fail status and risk category
- ✅ Visual performance trends (line charts over time)
- ✅ Input feature transparency (see what impacts predictions)
- ✅ Simple, actionable insights and recommendations

### Teacher Features
- ✅ Manage student records (add, edit, delete)
- ✅ Bulk or individual student predictions
- ✅ View class analytics (risk distribution, average scores)
- ✅ Filter students by risk category (High/Medium/Low)
- ✅ Track prediction history and trends

### Core Capabilities
- **Prediction Outputs**: Score (0-100), Pass/Fail status, Risk Category (Low/Medium/High)
- **Input Features**: Study hours, Attendance, Assignments score, Past marks, Engagement metrics
- **Authentication**: Email/password with JWT tokens and role-based access control
- **Database**: SQLite for local development, PostgreSQL ready for production

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS |
| **Backend** | Python FastAPI + SQLAlchemy ORM |
| **ML Model** | scikit-learn (Random Forest + preprocessing pipeline) |
| **Database** | SQLite (dev) / PostgreSQL (prod) |
| **Auth** | JWT tokens + bcrypt password hashing |

## 📁 Project Structure

```
student-performance-predictor/
├── frontend/                  # React Vite application
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── context/          # Auth context provider
│   │   ├── services/         # API client services
│   │   ├── types/            # TypeScript interfaces
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css         # Tailwind styles
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── backend/                   # FastAPI Python application
│   ├── app/
│   │   ├── api/              # API route handlers
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   ├── middleware/       # Auth middleware
│   │   ├── database.py       # DB configuration
│   │   ├── config.py         # App configuration
│   │   └── main.py           # FastAPI app entry
│   ├── requirements.txt
│   ├── .env.example
│   └── run.py
├── model/                     # ML model code
│   ├── train.py              # Training script
│   ├── predict.py            # Inference utility
│   ├── preprocessing.py      # Data preprocessing
│   ├── model_pipeline.pkl    # Saved model (generated)
│   ├── scaler.pkl            # Feature scaler (generated)
│   └── model_info.json       # Model metadata
├── dataset/                   # Training data
│   ├── student_data.csv      # Synthetic dataset
│   └── README_DATASET.md     # Data documentation
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md       # System architecture
│   ├── API.md                # API endpoint reference
│   └── SETUP.md              # Installation & run guide
├── agile/                     # Project management
│   ├── USER_STORIES.md       # Feature user stories
│   ├── BACKLOG.md            # Development backlog
│   └── SPRINT_PLAN.md        # Sprint breakdown
└── demo/                      # Demo assets
    └── DEMO.md               # Screenshots & demo info
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ (for frontend)
- Python 3.9+ (for backend)
- Git

### 1. Clone & Navigate
```bash
git clone <repo-url>
cd student-performance-predictor
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python run.py
# Backend runs on http://localhost:8000
```

### 3. Train ML Model (Optional)
```bash
cd model
python train.py
# Generates model_pipeline.pkl and scaler.pkl
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### 5. Access the App
- **Landing Page**: http://localhost:5173
- **Backend API**: http://localhost:8000/docs (Swagger UI)
- **Default Credentials**: 
  - Teacher: `teacher@school.com` / `password123`
  - Student: `student@school.com` / `password123`

## 📊 Sample Predictions

### Input Features
```json
{
  "study_hours": 5,
  "attendance": 92,
  "assignments_score": 85,
  "past_marks": 78,
  "engagement_score": 8
}
```

### Output
```json
{
  "predicted_score": 82,
  "pass_fail": "Pass",
  "risk_category": "Low",
  "confidence": 0.94
}
```

## 🔐 Authentication Flow

1. **Register**: User creates account with email, password, and role selection
2. **Login**: Email/password authentication returns JWT token
3. **Role Check**: Token includes role claim (student/teacher)
4. **Access Control**: Role-based middleware enforces permissions
5. **Dashboard Redirect**: Automatic redirect to appropriate dashboard

## 📈 ML Model Details

### Algorithm
- **Base Estimator**: Random Forest Classifier (100 trees)
- **Features**: 5 continuous features (study hours, attendance, etc.)
- **Preprocessing**: StandardScaler for normalization
- **Train/Test Split**: 80/20 with stratification
- **Target Variable**: Predicted score + pass/fail derivation

### Performance Metrics
- Accuracy: ~89% (on synthetic test data)
- Features: study_hours, attendance, assignments_score, past_marks, engagement_score

### Risk Category Logic
- **Low Risk**: Predicted score ≥ 75
- **Medium Risk**: Predicted score 60-74
- **High Risk**: Predicted score < 60

## 📱 Screenshots

See `/demo` folder for application screenshots:
- Landing page with call-to-action
- Student dashboard with predictions and trends
- Teacher dashboard with student management and analytics
- Data visualization examples

## 📚 Documentation

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** – System design and component interactions
- **[API.md](docs/API.md)** – Complete API endpoint documentation with examples
- **[SETUP.md](docs/SETUP.md)** – Detailed installation and troubleshooting guide
- **[USER_STORIES.md](agile/USER_STORIES.md)** – Feature requirements and user flows
- **[DATASET.md](dataset/README_DATASET.md)** – Data format and generation details

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 🔄 API Examples

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@school.com",
    "password": "password123"
  }'
```

### Get Student Predictions
```bash
curl -X GET http://localhost:8000/api/predictions/my \
  -H "Authorization: Bearer <token>"
```

### Create Prediction
```bash
curl -X POST http://localhost:8000/api/predictions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "study_hours": 5,
    "attendance": 92,
    "assignments_score": 85,
    "past_marks": 78,
    "engagement_score": 8
  }'
```

## 🎓 Learning Outcomes

This project demonstrates:
- Full-stack web development with React and FastAPI
- Machine learning model training and inference
- Role-based authentication and authorization
- RESTful API design principles
- Database design and ORM patterns
- TypeScript for type safety
- Responsive UI with Tailwind CSS
- Production deployment considerations

## 📝 License

MIT License – See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Submit a pull request

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ for educators and students**

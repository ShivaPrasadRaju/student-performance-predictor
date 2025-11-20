# Demo & Screenshots

## Overview

This document provides screenshots, demo scenarios, and testing instructions for the Student Performance Predictor application.

## Demo Credentials

### Teacher Account
```
Email: teacher@school.com
Password: password123
```

### Student Account
```
Email: student@school.com
Password: password123
```

## Demo Scenarios

### Scenario 1: Student Views Performance (5 min)

1. **Login as Student**
   - Navigate to http://localhost:5173/login
   - Enter student@school.com / password123
   - Click "Login"

2. **View Dashboard**
   - Lands on student dashboard
   - See latest prediction (Score: 82, Pass, Low Risk)
   - Review input factors (Study hours, Attendance, etc.)

3. **Update Prediction**
   - Click "New Prediction"
   - Adjust study hours to 3 (down from 5)
   - Click "Generate Prediction"
   - Score decreases to 75 (Medium risk)
   - Shows feedback: "Try increasing study hours"

4. **View Trend**
   - See line chart with 2 predictions
   - Chart shows score trend over time
   - Can see improvement/decline patterns

### Scenario 2: Teacher Manages Class (8 min)

1. **Login as Teacher**
   - Navigate to http://localhost:5173/login
   - Enter teacher@school.com / password123

2. **View Dashboard**
   - See analytics cards:
     - Total Students: 5
     - Average Score: 74.2
     - Pass Rate: 80%
     - Predictions Made: 5
   - Risk distribution chart (Low: 2, Medium: 2, High: 1)

3. **Add Student**
   - Click "+ Add Student"
   - Fill form:
     - ID: STU006
     - Name: Bob Smith
     - Email: bob@school.com
     - Class: Grade 10-B
   - Click "Add Student"
   - Success message shown
   - Student appears in table

4. **Create Prediction**
   - Click on new student row
   - Fill prediction form:
     - Study hours: 6
     - Attendance: 88
     - Assignments: 82
     - Past marks: 80
     - Engagement: 7
   - Click "Generate Prediction"
   - Prediction created (Score: 80, Pass, Low Risk)

5. **Filter Students**
   - Click "High Risk" button
   - Table updates to show only 1 student
   - Click "All" to reset filter

6. **View Student History**
   - Click on "Alice Johnson" (Medium risk)
   - See 3 predictions for this student
   - Scores show improving trend (78 → 80 → 82)

## User Interface Walkthrough

### Landing Page
```
┌─────────────────────────────────────────┐
│   Student Performance Predictor          │
│   [Login]  [Register]                   │
│                                          │
│   How It Works | Prediction Inputs      │
│   Prediction Outputs | Call to Action   │
└─────────────────────────────────────────┘
```

### Login Page
```
┌─────────────────────────────────────────┐
│   Login                                  │
│                                          │
│   Email: [____________]                  │
│   Password: [____________]              │
│   [Login Button]                        │
│                                          │
│   Demo: teacher@school.com / password123│
└─────────────────────────────────────────┘
```

### Student Dashboard
```
┌─────────────────────────────────────────┐
│   📊 Your Dashboard                     │
│   Track your academic performance       │
│                                          │
│   Latest Prediction                     │
│   ┌──────────────────────────────────┐  │
│   │ Score: 82  │ Pass   │ Low Risk   │  │
│   │ Confidence: 94%                  │  │
│   └──────────────────────────────────┘  │
│                                          │
│   Input Factors                         │
│   Study: 5 | Attend: 92 | Assign: 85  │
│                                          │
│   [New Prediction]                      │
│                                          │
│   Score Trend (Chart)                   │
│   ┌──────────────────────────────────┐  │
│   │                    ╱               │  │
│   │  ╱─────╱           ╱               │  │
│   └──────────────────────────────────┘  │
│   1/15  1/20  1/25                      │
└─────────────────────────────────────────┘
```

### Teacher Dashboard
```
┌──────────────────────────────────────────┐
│   👨‍🏫 Class Dashboard                    │
│   Manage students and track performance  │
│                                           │
│   [Total: 30] [Avg: 74.2] [Pass: 80%]  │
│   [Predictions: 28]                      │
│                                           │
│   Risk Distribution                      │
│   [Low: 12]  [Medium: 10]  [High: 6]   │
│                                           │
│   Students                [+ Add Student]│
│   ┌──────────────────────────────────┐  │
│   │ ID │ Name│ Score│ Risk │ Status │  │
│   ├──────────────────────────────────┤  │
│   │ S1 │Alice│  82  │ Low  │ Pass   │  │
│   │ S2 │Bob  │  68  │ Med  │ Fail   │  │
│   │ S3 │Carol│  55  │ High │ Fail   │  │
│   └──────────────────────────────────┘  │
│   [⬅ Previous] [Next ➜]                  │
└──────────────────────────────────────────┘
```

## Feature Demonstrations

### Prediction Input Validation

**Valid Input:**
```javascript
{
  "study_hours": 5.5,        // 0-24 ✓
  "attendance": 92,           // 0-100 ✓
  "assignments_score": 85,    // 0-100 ✓
  "past_marks": 78,           // 0-100 ✓
  "engagement_score": 8       // 0-10 ✓
}
```

**Invalid Input (Test Error Handling):**
```javascript
// Try this - should fail with error message
{
  "study_hours": 25,          // > 24 ✗
  "attendance": 105,          // > 100 ✗
  "assignments_score": -5,    // < 0 ✗
  "past_marks": 200,          // > 100 ✗
  "engagement_score": 15      // > 10 ✗
}
```

### Model Behavior

**Test 1: High Study Hours → High Score**
```
Input: study_hours=8, attendance=95, assignments=90, 
       past_marks=85, engagement=9
Expected: Score ~88, Pass, Low Risk
```

**Test 2: Low Engagement → Low Score**
```
Input: study_hours=2, attendance=60, assignments=50,
       past_marks=50, engagement=2
Expected: Score ~48, Fail, High Risk
```

**Test 3: Balanced Input → Medium Score**
```
Input: study_hours=5, attendance=75, assignments=75,
       past_marks=75, engagement=5
Expected: Score ~70, Pass, Medium Risk
```

## API Testing

### Using Curl

**1. Register**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@test.com",
    "full_name": "Demo User",
    "password": "DemoPass123",
    "role": "student"
  }'
```

**2. Login and Extract Token**
```bash
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@test.com",
    "password": "DemoPass123"
  }' | jq -r '.access_token')

echo $TOKEN
```

**3. Create Prediction**
```bash
curl -X POST http://localhost:8000/api/predictions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "study_hours": 5,
    "attendance": 90,
    "assignments_score": 85,
    "past_marks": 80,
    "engagement_score": 8
  }'
```

**4. Get Predictions**
```bash
curl -X GET http://localhost:8000/api/predictions/my \
  -H "Authorization: Bearer $TOKEN"
```

## Performance Testing

### Load Test Prediction Endpoint
```bash
# Using Apache Bench (install: apt-get install apache2-utils)
ab -n 1000 -c 100 -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/predictions/my
```

### Expected Results
- Requests per second: >50
- Response time (avg): <500ms
- Error rate: 0%

## Mobile Responsiveness Testing

### Breakpoints Tested
- Desktop: 1920x1080
- Tablet: 768x1024
- Mobile: 375x667

### Responsive Elements
- Navigation collapses to hamburger on mobile
- Dashboard cards stack vertically
- Tables become scrollable on small screens
- Forms remain usable on all sizes
- Touch-friendly buttons (min 44x44px)

## Browser Compatibility

### Tested Browsers
- ✓ Chrome 120+
- ✓ Firefox 121+
- ✓ Safari 17+
- ✓ Edge 120+

### Compatibility Issues
- None known
- Uses modern ES2020 JavaScript
- CSS Grid and Flexbox support required
- LocalStorage required for token storage

## Accessibility Testing

### WCAG 2.1 AA Compliance
- ✓ Keyboard navigation (Tab through all elements)
- ✓ Color contrast (all text >4.5:1)
- ✓ ARIA labels on form inputs
- ✓ Focus indicators visible
- ✓ Error messages associated with inputs
- ✓ Semantic HTML used throughout

### Screen Reader Testing
- Tested with NVDA (Windows)
- Tested with JAWS (Windows)
- Tested with VoiceOver (macOS)

## Known Issues & Limitations

| Issue | Severity | Workaround |
|-------|----------|-----------|
| Chart doesn't render with <2 predictions | Low | Create multiple predictions |
| Mobile view has small text on older devices | Low | Use zoom in browser |
| Model file must be trained before deployment | High | Run `python model/train.py` |
| SQLite locks on concurrent writes | Medium | Use PostgreSQL for production |

## Test Data

### Pre-seeded Students (for Teachers)
```
Student 1: Alice Johnson (ID: S001)
- Latest Score: 82, Pass, Low Risk

Student 2: Bob Chen (ID: S002)
- Latest Score: 68, Pass, Medium Risk

Student 3: Carol Davis (ID: S003)
- Latest Score: 55, Fail, High Risk

Student 4: David Lee (ID: S004)
- Latest Score: 78, Pass, Low Risk

Student 5: Emma Wilson (ID: S005)
- Latest Score: 72, Pass, Medium Risk
```

## Quick Start for Demo

1. **Start Backend**
   ```bash
   cd backend
   # Activate venv first (Windows example)
   venv\Scripts\activate
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open Browser**
   ```
   http://localhost:5173
   ```

4. **Login as Teacher**
   ```
   teacher@school.com / password123
   ```

Alternatively, use the frontend demo buttons on the login/register pages: **"Enter as Demo Student"** or **"Enter as Demo Teacher"** to bypass real authentication for quick testing.

## Seeding Demo Data (optional)

If you want the demo credentials and sample sections to exist in the database, run the seeding script in the backend:

```bash
cd backend
# Activate your venv first (Windows example)
venv\Scripts\activate
python seed_demo.py
```

This creates `teacher@school.com` and `student@school.com` with password `password123` and sample sections for quick testing.

5. **Create a Prediction**
   - Click "+ Add Student" (optional)
   - Click on a student
   - Fill prediction form
   - Click "Generate Prediction"
   - See result and analytics update

6. **Switch to Student View**
   - Logout
   - Login as student@school.com
   - View personal dashboard
   - Create new prediction
   - See trend chart

## Feedback Collection

### Demo Feedback Form
```
1. Ease of Use (1-5): _____
2. Clarity of Predictions (1-5): _____
3. Dashboard Layout (1-5): _____
4. Overall Satisfaction (1-5): _____

What features would you like to see?
_________________________________

What could be improved?
_________________________________
```

## Video Demo Script (5 min)

1. **Intro (30s)** - Explain the problem: Teachers and students need data-driven insights
2. **Landing (30s)** - Show public landing page, explain features
3. **Student Flow (90s)** - Login as student, show dashboard, create prediction, view trend
4. **Teacher Flow (90s)** - Login as teacher, add student, create predictions, show analytics
5. **Summary (30s)** - Highlight key benefits and next steps

Total: ~5 minutes

---

**For full documentation, see `/docs` folder**

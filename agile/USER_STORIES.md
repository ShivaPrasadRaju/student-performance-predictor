# User Stories

## Student User Stories

### Story 1: View My Performance Prediction
**As a** student  
**I want to** see my predicted academic performance  
**So that** I understand my likely final score and pass/fail status

**Acceptance Criteria:**
- Student can login with email/password
- Dashboard displays latest prediction score
- Pass/Fail status is clearly shown with colored badge
- Risk category (Low/Medium/High) is visible
- Prediction includes model confidence percentage
- Error message shown if no predictions exist
- User can create new prediction anytime

### Story 2: Track My Performance Over Time
**As a** student  
**I want to** see my prediction history and trends  
**So that** I can monitor my academic progress

**Acceptance Criteria:**
- Student can view up to 10 previous predictions
- Line chart displays score trend over time
- Each prediction shows creation date
- Can filter predictions by date range (future)
- Predictions sorted by most recent first
- No data message if fewer than 2 predictions

### Story 3: Update My Performance Data
**As a** student  
**I want to** create a new prediction with updated data  
**So that** I can see how my score might change with better study habits

**Acceptance Criteria:**
- Form has 5 input fields (study hours, attendance, etc.)
- Input validation with helpful error messages
- Clear ranges shown for each field
- "Generate Prediction" button creates new entry
- Success message shown after creation
- New prediction appears at top of history
- Can adjust and re-predict multiple times

### Story 4: Understand My Risk Level
**As a** student  
**I want to** understand why I'm classified as Low/Medium/High risk  
**So that** I know what areas to focus on

**Acceptance Criteria:**
- Risk category clearly labeled with color-coding
- Tooltip or info section explains each category
- Suggestions shown (e.g., "Improve attendance to reduce risk")
- Links to resources or tips (future enhancement)
- Easy to understand language

### Story 5: View Input Factors Transparency
**As a** student  
**I want to** see what input features influenced my prediction  
**So that** I understand the model's reasoning

**Acceptance Criteria:**
- Student can see their input values (study hours, attendance, etc.)
- Display current values alongside prediction
- Clear labeling of each factor
- Educational info about why each factor matters
- Can trace how changing a factor might affect score

---

## Teacher User Stories

### Story 6: Manage My Class Students
**As a** teacher  
**I want to** add, edit, and remove students from my class  
**So that** I can keep student roster up-to-date

**Acceptance Criteria:**
- Add Student form with: student_id, name, email, class_name
- Validation for required fields and email format
- Success message after adding
- Edit functionality for student details
- Delete with confirmation dialog
- List shows all students with actions
- Pagination if more than 50 students

### Story 7: Generate Predictions for Students
**As a** teacher  
**I want to** create predictions for my students  
**So that** I can assess their likely performance

**Acceptance Criteria:**
- Teacher can bulk select students for prediction
- Or create prediction for single student
- Input form for the 5 features with validation
- Can use same data for multiple students
- Batch prediction (coming soon)
- Each prediction linked to student record
- Confirmation before creating predictions

### Story 8: View Class Analytics Dashboard
**As a** teacher  
**I want to** see overall class performance analytics  
**So that** I can identify trends and at-risk students

**Acceptance Criteria:**
- Dashboard shows key metrics:
  - Total students in class
  - Average predicted score
  - Pass rate percentage
  - Number of predictions made
- Risk distribution chart (Low/Medium/High counts)
- Metrics update after each prediction
- Mobile-friendly responsive design
- Export analytics to CSV (future)

### Story 9: Identify At-Risk Students
**As a** teacher  
**I want to** filter and see only high-risk students  
**So that** I can prioritize intervention

**Acceptance Criteria:**
- Filter buttons: All, Low Risk, Medium Risk, High Risk
- Student table updates based on filter
- Shows risk category for each student
- Latest prediction score visible
- Pass/Fail status highlighted
- Quick action buttons (email, notes)
- Sorted by risk level (High first)

### Story 10: Track Student Prediction History
**As a** teacher  
**I want to** see prediction history for each student  
**So that** I can monitor their progress over time

**Acceptance Criteria:**
- Click on student to view their predictions
- Timeline of predictions with dates
- Can see if score improved or declined
- Trend visualization
- Compare with class average
- Export student report (future)

### Story 11: Manage Class Records
**As a** teacher  
**I want to** have a comprehensive student management interface  
**So that** I can manage all class operations in one place

**Acceptance Criteria:**
- Table view of all students with columns:
  - Student ID, Name, Email, Class
  - Latest Score, Risk Category, Status
  - Action buttons (edit, delete)
- Sortable columns
- Search functionality
- Inline editing option
- Bulk actions (future)

---

## Admin/System User Stories (Future)

### Story 12: Monitor System Health
**As a** system admin  
**I want to** monitor API uptime and performance  
**So that** I can ensure reliable service

### Story 13: Retrain ML Model
**As a** system admin  
**I want to** retrain the ML model with new data  
**So that** predictions remain accurate over time

### Story 14: Manage User Accounts
**As a** system admin  
**I want to** manage teacher and student accounts  
**So that** I can maintain system access control

---

## Non-Functional Requirements

### Performance
- Student dashboard loads in < 2 seconds
- Prediction generation < 500ms
- API response time < 1 second
- Support 1000 concurrent users

### Security
- All passwords hashed with bcrypt
- JWT tokens expire after 30 minutes
- HTTPS only in production
- SQL injection prevention via ORM
- Input validation on all endpoints

### Usability
- Responsive design for mobile/tablet/desktop
- Accessibility (WCAG 2.1 AA standard)
- Intuitive navigation
- Clear error messages
- Consistent color scheme

### Reliability
- 99.5% uptime target
- Automatic database backups
- Error logging and monitoring
- Graceful degradation

### Maintainability
- Clean, documented code
- Unit test coverage > 80%
- API documentation with examples
- Clear architecture documentation

---

## Acceptance Testing

For each story, test cases include:
1. Happy path (successful flow)
2. Error cases (invalid input, network errors)
3. Edge cases (empty data, max values)
4. Permission checks (unauthorized access)
5. Mobile responsiveness
6. Browser compatibility (Chrome, Firefox, Safari, Edge)

---

## Definition of Done

A story is complete when:
- ✅ Code written and reviewed
- ✅ Unit tests pass (>80% coverage)
- ✅ Integration tests pass
- ✅ Manual testing completed
- ✅ Documentation updated
- ✅ No critical bugs
- ✅ Performance acceptable
- ✅ Accessibility verified
- ✅ Product owner approval

"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# ===================== Auth Schemas =====================

class UserRegister(BaseModel):
    """User registration schema"""
    email: EmailStr
    full_name: str
    password: str = Field(..., min_length=8)
    role: str = Field(..., pattern="^(student|teacher)$")

class UserLogin(BaseModel):
    """User login schema"""
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    """Token response schema"""
    access_token: str
    token_type: str = "bearer"
    user: 'UserResponse'

class UserResponse(BaseModel):
    """User response schema"""
    id: int
    email: str
    full_name: str
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# ===================== Student Schemas =====================

class StudentCreate(BaseModel):
    """Create student schema"""
    student_id: str
    name: str
    email: str
    class_name: str
    year: int = Field(..., ge=1, le=4)
    section: str = Field(..., min_length=1, max_length=3)

class StudentUpdate(BaseModel):
    """Update student schema"""
    name: Optional[str] = None
    email: Optional[str] = None
    class_name: Optional[str] = None
    year: Optional[int] = None
    section: Optional[str] = None

class StudentResponse(BaseModel):
    """Student response schema"""
    id: int
    student_id: str
    name: str
    email: str
    class_name: str
    year: int
    section: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ===================== Prediction Schemas =====================

class PredictionRequest(BaseModel):
    """Prediction request schema"""
    study_hours: float = Field(..., ge=0, le=24)
    attendance: float = Field(..., ge=0, le=100)
    assignments_score: float = Field(..., ge=0, le=100)
    past_marks: float = Field(..., ge=0, le=100)
    engagement_score: float = Field(..., ge=0, le=10)
    student_id: Optional[int] = None  # For teachers creating predictions

class PredictionResponse(BaseModel):
    """Prediction response schema"""
    id: int
    predicted_score: float
    pass_fail: str
    risk_category: str
    confidence: float
    study_hours: float
    attendance: float
    assignments_score: float
    past_marks: float
    engagement_score: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class PredictionWithStudentResponse(PredictionResponse):
    """Prediction response with student info"""
    student: Optional[StudentResponse] = None

# ===================== Analytics Schemas =====================

class RiskDistribution(BaseModel):
    """Risk category distribution"""
    low_risk: int
    medium_risk: int
    high_risk: int

class ClassAnalytics(BaseModel):
    """Class analytics schema"""
    total_students: int
    total_predictions: int
    average_score: float
    risk_distribution: RiskDistribution
    pass_rate: float

class StudentWithLatestPrediction(BaseModel):
    """Student with their latest prediction"""
    id: int
    student_id: str
    name: str
    email: str
    class_name: str
    year: int
    section: str
    latest_prediction: Optional[PredictionResponse] = None
    
    class Config:
        from_attributes = True

# Update forward refs
TokenResponse.model_rebuild()

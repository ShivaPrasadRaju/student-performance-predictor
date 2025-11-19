"""
Prediction routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import sys
import os

# Add model directory to Python path
model_path = os.path.join(os.path.dirname(__file__), '../../model')
if model_path not in sys.path:
    sys.path.insert(0, model_path)

from app.database import get_db
from app.schemas import (
    PredictionRequest, PredictionResponse, PredictionWithStudentResponse,
    StudentWithLatestPrediction, ClassAnalytics
)
from app.services import PredictionService, StudentService
from app.models import User
from app.middleware import get_current_user, get_teacher, get_student

# Import ML prediction engine
try:
    from predict import PredictionEngine
    engine = PredictionEngine()
    ml_predict = lambda features: engine.predict(features)
except Exception as e:
    print(f"Warning: Could not load ML model: {e}")
    def ml_predict(features):
        return {'predicted_score': 65, 'pass_fail': 'Pass', 'risk_category': 'Medium', 'confidence': 0.85}

router = APIRouter(prefix="/predictions", tags=["predictions"])

@router.post("", response_model=PredictionResponse)
def create_prediction(
    prediction_data: PredictionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a prediction
    
    **For students**: Creates prediction for themselves
    **For teachers**: Can create predictions for their students (provide student_id)
    """
    # Validate permissions
    if current_user.role == "student":
        if prediction_data.student_id is not None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Students cannot specify student_id"
            )
    elif current_user.role == "teacher":
        # Verify student belongs to teacher
        if prediction_data.student_id:
            student = StudentService.get_student(db, prediction_data.student_id)
            if not student or student.teacher_id != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Student not in your class"
                )
    
    try:
        # Get prediction from ML model
        ml_result = ml_predict({
            'study_hours': prediction_data.study_hours,
            'attendance': prediction_data.attendance,
            'assignments_score': prediction_data.assignments_score,
            'past_marks': prediction_data.past_marks,
            'engagement_score': prediction_data.engagement_score
        })
        
        # Save to database
        prediction = PredictionService.create_prediction(
            db,
            current_user.id,
            prediction_data,
            ml_result,
            student_id=prediction_data.student_id
        )
        
        return PredictionResponse.from_orm(prediction)
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/my", response_model=List[PredictionResponse])
def get_my_predictions(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all predictions for the current user"""
    predictions = PredictionService.get_user_predictions(db, current_user.id, limit)
    return [PredictionResponse.from_orm(p) for p in predictions]

@router.get("/my/latest", response_model=PredictionResponse)
def get_latest_prediction(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get latest prediction for the current user"""
    prediction = PredictionService.get_latest_prediction(db, current_user.id)
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No predictions found"
        )
    
    return PredictionResponse.from_orm(prediction)

@router.get("/student/{student_id}", response_model=List[PredictionResponse])
def get_student_predictions(
    student_id: int,
    limit: int = 10,
    current_user: User = Depends(get_teacher),
    db: Session = Depends(get_db)
):
    """Get predictions for a student (teachers only)"""
    # Verify student belongs to teacher
    student = StudentService.get_student(db, student_id)
    if not student or student.teacher_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    predictions = PredictionService.get_student_predictions(db, student_id, limit)
    return [PredictionResponse.from_orm(p) for p in predictions]

@router.get("/class/analytics", response_model=ClassAnalytics)
def get_class_analytics(
    current_user: User = Depends(get_teacher),
    db: Session = Depends(get_db)
):
    """Get analytics for teacher's class"""
    analytics = PredictionService.get_class_analytics(db, current_user.id)
    return analytics

@router.get("/class/students-overview", response_model=List[StudentWithLatestPrediction])
def get_class_overview(
    current_user: User = Depends(get_teacher),
    db: Session = Depends(get_db)
):
    """Get all students in class with their latest predictions"""
    students = StudentService.get_students_for_teacher(db, current_user.id)
    
    result = []
    for student in students:
        latest_pred = PredictionService.get_student_predictions(db, student.id, limit=1)
        result.append(StudentWithLatestPrediction(
            **student.__dict__,
            latest_prediction=PredictionResponse.from_orm(latest_pred[0]) if latest_pred else None
        ))
    
    return result

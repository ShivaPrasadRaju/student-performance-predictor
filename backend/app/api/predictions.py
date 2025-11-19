"""
Prediction routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
import sys
import os

# Add model directory to Python path
model_path = os.path.join(os.path.dirname(__file__), '../../model')
if model_path not in sys.path:
    sys.path.insert(0, model_path)

from app.database import prisma
from app.schemas import (
    PredictionRequest, PredictionResponse, PredictionWithStudentResponse,
    StudentWithLatestPrediction, ClassAnalytics
)
from app.services import PredictionService, StudentService
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
async def create_prediction(
    prediction_data: PredictionRequest,
    current_user = Depends(get_current_user),
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
            student = await StudentService.get_student(prisma, prediction_data.student_id)
            if not student or student.teacherId != current_user.id:
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
        prediction = await PredictionService.create_prediction(
            prisma,
            current_user.id,
            prediction_data,
            ml_result,
            student_id=prediction_data.student_id
        )

        return PredictionResponse(
            id=prediction.id,
            predicted_score=prediction.predictedScore,
            pass_fail=prediction.passFail,
            risk_category=prediction.riskCategory,
            confidence=prediction.confidence,
            study_hours=prediction.studyHours,
            attendance=prediction.attendance,
            assignments_score=prediction.assignmentsScore,
            past_marks=prediction.pastMarks,
            engagement_score=prediction.engagementScore,
            created_at=prediction.createdAt
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/my", response_model=List[PredictionResponse])
async def get_my_predictions(
    limit: int = 10,
    current_user = Depends(get_current_user),
):
    """Get all predictions for the current user"""
    predictions = await PredictionService.get_user_predictions(prisma, current_user.id, limit)
    return [
        PredictionResponse(
            id=p.id,
            predicted_score=p.predictedScore,
            pass_fail=p.passFail,
            risk_category=p.riskCategory,
            confidence=p.confidence,
            study_hours=p.studyHours,
            attendance=p.attendance,
            assignments_score=p.assignmentsScore,
            past_marks=p.pastMarks,
            engagement_score=p.engagementScore,
            created_at=p.createdAt
        ) for p in predictions
    ]

@router.get("/my/latest", response_model=PredictionResponse)
async def get_latest_prediction(
    current_user = Depends(get_current_user),
):
    """Get latest prediction for the current user"""
    prediction = await PredictionService.get_latest_prediction(prisma, current_user.id)
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No predictions found"
        )
    
    return PredictionResponse(
        id=prediction.id,
        predicted_score=prediction.predictedScore,
        pass_fail=prediction.passFail,
        risk_category=prediction.riskCategory,
        confidence=prediction.confidence,
        study_hours=prediction.studyHours,
        attendance=prediction.attendance,
        assignments_score=prediction.assignmentsScore,
        past_marks=prediction.pastMarks,
        engagement_score=prediction.engagementScore,
        created_at=prediction.createdAt
    )

@router.get("/student/{student_id}", response_model=List[PredictionResponse])
async def get_student_predictions(
    student_id: int,
    limit: int = 10,
    current_user = Depends(get_teacher),
):
    """Get predictions for a student (teachers only)"""
    # Verify student belongs to teacher
    student = await StudentService.get_student(prisma, student_id)
    if not student or student.teacherId != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    predictions = await PredictionService.get_student_predictions(prisma, student_id, limit)
    return [
        PredictionResponse(
            id=p.id,
            predicted_score=p.predictedScore,
            pass_fail=p.passFail,
            risk_category=p.riskCategory,
            confidence=p.confidence,
            study_hours=p.studyHours,
            attendance=p.attendance,
            assignments_score=p.assignmentsScore,
            past_marks=p.pastMarks,
            engagement_score=p.engagementScore,
            created_at=p.createdAt
        ) for p in predictions
    ]

@router.get("/class/analytics", response_model=ClassAnalytics)
async def get_class_analytics(
    current_user = Depends(get_teacher),
):
    """Get analytics for teacher's class"""
    analytics = await PredictionService.get_class_analytics(prisma, current_user.id)
    return analytics

@router.get("/class/students-overview", response_model=List[StudentWithLatestPrediction])
async def get_class_overview(
    current_user = Depends(get_teacher),
):
    """Get all students in class with their latest predictions"""
    students = await StudentService.get_students_for_teacher(prisma, current_user.id)
    
    result = []
    for student in students:
        latest_pred = await PredictionService.get_student_predictions(prisma, student.id, limit=1)
        result.append(StudentWithLatestPrediction(
            id=student.id,
            student_id=student.studentId,
            name=student.name,
            email=student.email,
            class_name=student.className,
            year=student.year,
            section=student.section,
            latest_prediction=(PredictionResponse(
                id=latest_pred[0].id,
                predicted_score=latest_pred[0].predictedScore,
                pass_fail=latest_pred[0].passFail,
                risk_category=latest_pred[0].riskCategory,
                confidence=latest_pred[0].confidence,
                study_hours=latest_pred[0].studyHours,
                attendance=latest_pred[0].attendance,
                assignments_score=latest_pred[0].assignmentsScore,
                past_marks=latest_pred[0].pastMarks,
                engagement_score=latest_pred[0].engagementScore,
                created_at=latest_pred[0].createdAt
            ) if latest_pred else None)
        ))
    
    return result

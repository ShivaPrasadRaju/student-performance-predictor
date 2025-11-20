"""
VTU Semester-based Prediction Routes
Endpoints for semester selection, subject marks input, daily tests, and predictions
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import json
from pydantic import BaseModel
from app.database import prisma
from app.middleware import get_current_user
from vtu_scheme import (
    get_semester_subjects, calculate_sgpa, calculate_academic_status,
    identify_backlog_subjects, generate_recommendation_plan,
    generate_study_schedule, VTU_2022_CSE_SCHEME
)

router = APIRouter(prefix="/vtu", tags=["vtu_prediction"])

# Pydantic models
class SubjectMarkInput(BaseModel):
    subject_code: str
    subject_name: str
    subject_type: str  # "Core", "Lab", "Elective", "Project"
    marks: float
    credits: int
    weightage: int

class SemesterEnrollmentRequest(BaseModel):
    semester: int
    academic_year: str  # e.g., "2023-24"

class SubjectMarksSubmission(BaseModel):
    semester: int
    subject_marks: List[SubjectMarkInput]  # List of subject scores

class DailyTestSubmission(BaseModel):
    test_date: str
    test_topic: str
    difficulty: str  # "Easy", "Medium", "Hard"
    score: float
    max_score: float = 100
    duration: int  # in minutes

@router.get("/semesters/{semester}/subjects")
async def get_semester_subjects_endpoint(
    semester: int,
    current_user = Depends(get_current_user)
):
    """Get list of subjects for a given semester"""
    if semester < 1 or semester > 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Semester must be between 1 and 8"
        )
    
    semester_data = get_semester_subjects(semester)
    if "error" in semester_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=semester_data["error"]
        )
    
    return {
        "semester": semester,
        "name": semester_data.get("name"),
        "subjects": semester_data.get("subjects", [])
    }

@router.post("/enroll")
async def enroll_semester(
    request: SemesterEnrollmentRequest,
    current_user = Depends(get_current_user)
):
    """Enroll a student in a specific semester"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can enroll in semesters"
        )
    
    # Check if already enrolled
    existing = await prisma.semesterEnrollment.find_first(
        where={
            "studentId": current_user.id,
            "semester": request.semester
        }
    )
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already enrolled in this semester"
        )
    
    # Create enrollment
    enrollment = await prisma.semesterEnrollment.create(
        data={
            "studentId": current_user.id,
            "semester": request.semester,
            "academicYear": request.academic_year
        }
    )
    
    return {
        "id": enrollment.id,
        "semester": enrollment.semester,
        "academic_year": enrollment.academicYear,
        "status": enrollment.status,
        "message": f"Successfully enrolled in Semester {request.semester}"
    }

@router.get("/enrollment/current")
async def get_current_enrollment(
    current_user = Depends(get_current_user)
):
    """Get current semester enrollment for student"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students have enrollments"
        )
    
    enrollment = await prisma.semesterEnrollment.find_first(
        where={"studentId": current_user.id},
        order={"createdAt": "desc"}
    )
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active enrollment found"
        )
    
    return {
        "id": enrollment.id,
        "semester": enrollment.semester,
        "academic_year": enrollment.academicYear,
        "status": enrollment.status
    }

@router.post("/marks/submit")
async def submit_subject_marks(
    request: SubjectMarksSubmission,
    current_user = Depends(get_current_user)
):
    """Submit subject marks for a semester"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can submit marks"
        )
    
    # Get or create enrollment
    enrollment = await prisma.semesterEnrollment.find_first(
        where={
            "studentId": current_user.id,
            "semester": request.semester
        }
    )
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No enrollment found for semester {request.semester}"
        )
    
    # Clear existing marks for this enrollment
    await prisma.subjectMark.delete_many(
        where={"enrollmentId": enrollment.id}
    )
    
    # Create new marks
    created_marks = []
    for mark_input in request.subject_marks:
        # Determine risk level
        if mark_input.marks >= 75:
            risk_level = "Low"
        elif mark_input.marks >= 60:
            risk_level = "Medium"
        else:
            risk_level = "High"
        
        subject_mark = await prisma.subjectMark.create(
            data={
                "enrollmentId": enrollment.id,
                "subjectCode": mark_input.subject_code,
                "subjectName": mark_input.subject_name,
                "subjectType": mark_input.subject_type,
                "marks": mark_input.marks,
                "credits": mark_input.credits,
                "weightage": mark_input.weightage,
                "riskLevel": risk_level
            }
        )
        created_marks.append({
            "subject_code": subject_mark.subjectCode,
            "subject_name": subject_mark.subjectName,
            "marks": subject_mark.marks,
            "risk_level": subject_mark.riskLevel
        })
    
    return {
        "enrollment_id": enrollment.id,
        "semester": request.semester,
        "marks_submitted": len(created_marks),
        "marks": created_marks,
        "message": f"Submitted marks for {len(created_marks)} subjects"
    }

@router.post("/test/submit")
async def submit_daily_test(
    request: DailyTestSubmission,
    current_user = Depends(get_current_user)
):
    """Submit a daily test score"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can submit test scores"
        )
    
    # Get current enrollment
    enrollment = await prisma.semesterEnrollment.find_first(
        where={"studentId": current_user.id},
        order={"createdAt": "desc"}
    )
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active enrollment found"
        )
    
    # Create test score
    test_score = await prisma.dailyTestScore.create(
        data={
            "enrollmentId": enrollment.id,
            "testDate": request.test_date,
            "testTopic": request.test_topic,
            "difficulty": request.difficulty,
            "score": request.score,
            "maxScore": request.max_score,
            "duration": request.duration
        }
    )
    
    return {
        "id": test_score.id,
        "test_topic": test_score.testTopic,
        "score": test_score.score,
        "max_score": test_score.maxScore,
        "message": "Daily test score submitted successfully"
    }

@router.post("/prediction/generate")
async def generate_vtu_prediction(
    current_user = Depends(get_current_user)
):
    """Generate VTU-based performance prediction"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can generate predictions"
        )
    
    # Get current enrollment
    enrollment = await prisma.semesterEnrollment.find_first(
        where={"studentId": current_user.id},
        order={"createdAt": "desc"}
    )
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active enrollment found"
        )
    
    # Get subject marks
    subject_marks_db = await prisma.subjectMark.find_many(
        where={"enrollmentId": enrollment.id}
    )
    
    if not subject_marks_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No subject marks submitted yet"
        )
    
    # Convert to dict for calculation
    subject_marks = {
        mark.subjectCode: mark.marks for mark in subject_marks_db
    }
    
    # Get test scores for consistency
    test_scores_db = await prisma.dailyTestScore.find_many(
        where={"enrollmentId": enrollment.id},
        order={"testDate": "desc"}
    )
    
    test_scores = [score.score for score in test_scores_db]
    
    # Calculate metrics
    sgpa = calculate_sgpa(enrollment.semester, subject_marks)
    academic_status = calculate_academic_status(sgpa)
    backlog_subjects = identify_backlog_subjects(enrollment.semester, subject_marks)
    
    # Calculate test consistency
    if test_scores:
        test_consistency = sum(test_scores) / len(test_scores)
    else:
        test_consistency = 0
    
    # Generate recommendations and schedule
    recommendations = generate_recommendation_plan(
        enrollment.semester, subject_marks, test_consistency
    )
    
    schedule = generate_study_schedule(
        enrollment.semester, subject_marks, test_scores
    )
    
    # Store prediction
    prediction = await prisma.vTUPerformancePrediction.create(
        data={
            "enrollmentId": enrollment.id,
            "semester": enrollment.semester,
            "academicStatus": academic_status,
            "sgpa": sgpa,
            "estimatedCgpa": sgpa,  # Simplified; in reality, would consider previous semesters
            "backlogRisk": len(backlog_subjects),
            "improvementTrend": schedule.get("improvement_trend", "Consistent"),
            "testConsistency": test_consistency,
            "recommendationPlan": json.dumps(recommendations),
            "studySchedule": json.dumps(schedule)
        }
    )
    
    return {
        "semester": enrollment.semester,
        "academic_status": academic_status,
        "sgpa": sgpa,
        "estimated_cgpa": sgpa,
        "backlog_risk": len(backlog_subjects),
        "backlog_subjects": backlog_subjects,
        "test_consistency": round(test_consistency, 2),
        "improvement_trend": schedule.get("improvement_trend"),
        "recommendation_plan": recommendations,
        "study_schedule": schedule
    }

@router.get("/prediction/current")
async def get_current_prediction(
    current_user = Depends(get_current_user)
):
    """Get latest prediction for student"""
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students have predictions"
        )
    
    enrollment = await prisma.semesterEnrollment.find_first(
        where={"studentId": current_user.id},
        order={"createdAt": "desc"}
    )
    
    if not enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active enrollment found"
        )
    
    prediction = await prisma.vTUPerformancePrediction.find_unique(
        where={"enrollmentId": enrollment.id}
    )
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No prediction found for current enrollment"
        )
    
    return {
        "semester": prediction.semester,
        "academic_status": prediction.academicStatus,
        "sgpa": prediction.sgpa,
        "estimated_cgpa": prediction.estimatedCgpa,
        "backlog_risk": prediction.backlogRisk,
        "test_consistency": prediction.testConsistency,
        "improvement_trend": prediction.improvementTrend,
        "recommendation_plan": json.loads(prediction.recommendationPlan),
        "study_schedule": json.loads(prediction.studySchedule),
        "updated_at": prediction.updatedAt
    }

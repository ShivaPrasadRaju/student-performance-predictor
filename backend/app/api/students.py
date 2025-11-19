"""
Student management routes (for teachers)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas import StudentCreate, StudentUpdate, StudentResponse
from app.services import StudentService
from app.models import User
from app.middleware import get_teacher

router = APIRouter(prefix="/students", tags=["students"])

@router.post("", response_model=StudentResponse)
def create_student(
    student: StudentCreate,
    current_user: User = Depends(get_teacher),
    db: Session = Depends(get_db)
):
    """Create a new student (teachers only)"""
    db_student = StudentService.create_student(db, current_user.id, student)
    return StudentResponse.from_orm(db_student)

@router.get("", response_model=List[StudentResponse])
def get_students(
    current_user: User = Depends(get_teacher),
    db: Session = Depends(get_db)
):
    """Get all students for the current teacher"""
    students = StudentService.get_students_for_teacher(db, current_user.id)
    return [StudentResponse.from_orm(s) for s in students]

@router.get("/{student_id}", response_model=StudentResponse)
def get_student(
    student_id: int,
    current_user: User = Depends(get_teacher),
    db: Session = Depends(get_db)
):
    """Get a specific student"""
    student = StudentService.get_student(db, student_id)
    
    if not student or student.teacher_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return StudentResponse.from_orm(student)

@router.put("/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: int,
    update: StudentUpdate,
    current_user: User = Depends(get_teacher),
    db: Session = Depends(get_db)
):
    """Update a student"""
    student = StudentService.update_student(db, student_id, current_user.id, update)
    
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return StudentResponse.from_orm(student)

@router.delete("/{student_id}")
def delete_student(
    student_id: int,
    current_user: User = Depends(get_teacher),
    db: Session = Depends(get_db)
):
    """Delete a student"""
    success = StudentService.delete_student(db, student_id, current_user.id)
    
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return {"message": "Student deleted successfully"}

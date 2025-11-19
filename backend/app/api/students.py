"""
Student management routes (for teachers)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.database import prisma
from app.schemas import StudentCreate, StudentUpdate, StudentResponse
from app.services import StudentService
from app.middleware import get_teacher

router = APIRouter(prefix="/students", tags=["students"])

@router.post("", response_model=StudentResponse)
async def create_student(
    student: StudentCreate,
    current_user = Depends(get_teacher),
):
    """Create a new student (teachers only)"""
    db_student = await StudentService.create_student(prisma, current_user.id, student)
    return StudentResponse(
        id=db_student.id,
        student_id=db_student.studentId,
        name=db_student.name,
        email=db_student.email,
        class_name=db_student.className,
        year=db_student.year,
        section=db_student.section,
        section_id=db_student.sectionId,
        created_at=db_student.createdAt,
        updated_at=db_student.updatedAt
    )

@router.get("", response_model=List[StudentResponse])
async def get_students(
    current_user = Depends(get_teacher),
):
    """Get all students for the current teacher"""
    students = await StudentService.get_students_for_teacher(prisma, current_user.id)
    return [
        StudentResponse(
            id=s.id,
            student_id=s.studentId,
            name=s.name,
            email=s.email,
            class_name=s.className,
            year=s.year,
            section=s.section,
            section_id=s.sectionId,
            created_at=s.createdAt,
            updated_at=s.updatedAt
        )
        for s in students
    ]

@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(
    student_id: int,
    current_user = Depends(get_teacher),
):
    """Get a specific student"""
    student = await StudentService.get_student(prisma, student_id)
    
    if not student or student.teacherId != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return StudentResponse(
        id=student.id,
        student_id=student.studentId,
        name=student.name,
        email=student.email,
        class_name=student.className,
        year=student.year,
        section=student.section,
        section_id=student.sectionId,
        created_at=student.createdAt,
        updated_at=student.updatedAt
    )

@router.put("/{student_id}", response_model=StudentResponse)
async def update_student(
    student_id: int,
    update: StudentUpdate,
    current_user = Depends(get_teacher),
):
    """Update a student"""
    student = await StudentService.update_student(prisma, student_id, current_user.id, update)
    
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return StudentResponse(
        id=student.id,
        student_id=student.studentId,
        name=student.name,
        email=student.email,
        class_name=student.className,
        year=student.year,
        section=student.section,
        section_id=student.sectionId,
        created_at=student.createdAt,
        updated_at=student.updatedAt
    )

@router.delete("/{student_id}")
async def delete_student(
    student_id: int,
    current_user = Depends(get_teacher),
):
    """Delete a student"""
    success = await StudentService.delete_student(prisma, student_id, current_user.id)
    
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    return {"message": "Student deleted successfully"}

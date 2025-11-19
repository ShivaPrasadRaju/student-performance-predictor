"""
Section management endpoints (CRUD operations for class sections)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from app.database import prisma
from app.middleware import get_current_user
from app.schemas import SectionCreate, SectionUpdate, SectionResponse
from app.services import SectionService

router = APIRouter(prefix="/api/sections", tags=["sections"])


@router.post("", response_model=SectionResponse, status_code=status.HTTP_201_CREATED)
async def create_section(
    section: SectionCreate,
    current_user = Depends(get_current_user),
):
    """Create a new section for the teacher"""
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can create sections"
        )
    
    # Check if section already exists
    existing = await SectionService.get_section_by_name_and_year(
        prisma, current_user.id, section.name, section.year
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Section {section.name} for year {section.year} already exists"
        )
    
    db_section = await SectionService.create_section(prisma, current_user.id, section)
    return SectionResponse(
        id=db_section.id,
        name=db_section.name,
        year=db_section.year,
        teacher_id=db_section.teacherId,
        created_at=db_section.createdAt,
        updated_at=db_section.updatedAt
    )

@router.get("", response_model=List[SectionResponse])
async def get_sections(
    year: Optional[int] = None,
    current_user = Depends(get_current_user),
):
    """Get all sections for the current teacher, optionally filtered by year"""
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can view sections"
        )
    
    sections = await SectionService.get_sections_for_teacher(prisma, current_user.id, year)
    return [
        SectionResponse(
            id=s.id,
            name=s.name,
            year=s.year,
            teacher_id=s.teacherId,
            created_at=s.createdAt,
            updated_at=s.updatedAt
        ) for s in sections
    ]

@router.get("/{section_id}", response_model=SectionResponse)
async def get_section(
    section_id: int,
    current_user = Depends(get_current_user),
):
    """Get a specific section"""
    section = await SectionService.get_section(prisma, section_id)
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )
    
    if section.teacherId != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own sections"
        )
    
    return SectionResponse(
        id=section.id,
        name=section.name,
        year=section.year,
        teacher_id=section.teacherId,
        created_at=section.createdAt,
        updated_at=section.updatedAt
    )

@router.put("/{section_id}", response_model=SectionResponse)
async def update_section(
    section_id: int,
    section_update: SectionUpdate,
    current_user = Depends(get_current_user),
):
    """Update a section"""
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can update sections"
        )
    
    updated = await SectionService.update_section(prisma, section_id, current_user.id, section_update)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found or you don't have permission to update it"
        )
    
    return SectionResponse(
        id=updated.id,
        name=updated.name,
        year=updated.year,
        teacher_id=updated.teacherId,
        created_at=updated.createdAt,
        updated_at=updated.updatedAt
    )

@router.delete("/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_section(
    section_id: int,
    current_user = Depends(get_current_user),
):
    """Delete a section"""
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers can delete sections"
        )
    
    success = await SectionService.delete_section(prisma, section_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found or you don't have permission to delete it"
        )
    
    return None

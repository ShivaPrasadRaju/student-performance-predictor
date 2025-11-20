"""
Business logic services using Prisma ORM
"""
from typing import Optional, List
from app.schemas import (
    UserRegister, StudentCreate, StudentUpdate, PredictionRequest,
    SectionCreate, SectionUpdate, SectionResponse,
    RiskDistribution, ClassAnalytics
)
from app.services.security import hash_password, verify_password, create_access_token
from prisma import Prisma

# ===================== User Service =====================

class UserService:
    
    @staticmethod
    async def create_user(prisma: Prisma, user: UserRegister):
        """Create a new user"""
        db_user = await prisma.user.create(
            data={
                "email": user.email,
                "fullName": user.full_name,
                "hashedPassword": hash_password(user.password),
                "role": user.role
            }
        )
        return db_user
    
    @staticmethod
    async def get_user_by_email(prisma: Prisma, email: str) -> Optional:
        """Get user by email"""
        return await prisma.user.find_unique(where={"email": email})
    
    @staticmethod
    async def authenticate_user(prisma: Prisma, email: str, password: str) -> Optional:
        """Authenticate user with email and password"""
        user = await UserService.get_user_by_email(prisma, email)
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user
    
    @staticmethod
    async def get_user(prisma: Prisma, user_id: int) -> Optional:
        """Get user by ID"""
        return await prisma.user.find_unique(where={"id": user_id})

# ===================== Student Service =====================

class StudentService:
    
    @staticmethod
    async def create_student(prisma: Prisma, teacher_id: int, student: StudentCreate):
        """Create a new student"""
        db_student = await prisma.student.create(
            data={
                "studentId": student.student_id,
                "name": student.name,
                "email": student.email,
                "className": student.class_name,
                "year": student.year,
                "section": student.section,
                "teacherId": teacher_id
            }
        )
        return db_student
    
    @staticmethod
    async def get_students_for_teacher(prisma: Prisma, teacher_id: int) -> List:
        """Get all students for a teacher"""
        return await prisma.student.find_many(
            where={"teacherId": teacher_id}
        )
    
    @staticmethod
    async def get_student(prisma: Prisma, student_id: int) -> Optional:
        """Get student by ID"""
        return await prisma.student.find_unique(where={"id": student_id})
    
    @staticmethod
    async def update_student(
        prisma: Prisma, student_id: int, teacher_id: int, update: StudentUpdate
    ) -> Optional:
        """Update student (teacher only)"""
        # Verify ownership
        student = await prisma.student.find_unique(where={"id": student_id})
        if not student or student.teacherId != teacher_id:
            return None
        
        update_data = {}
        if update.name:
            update_data["name"] = update.name
        if update.email:
            update_data["email"] = update.email
        if update.class_name:
            update_data["className"] = update.class_name
        if getattr(update, 'year', None) is not None:
            update_data["year"] = update.year
        if getattr(update, 'section', None) is not None:
            update_data["section"] = update.section
        
        if not update_data:
            return student
        
        updated = await prisma.student.update(
            where={"id": student_id},
            data=update_data
        )
        return updated
    
    @staticmethod
    async def delete_student(prisma: Prisma, student_id: int, teacher_id: int) -> bool:
        """Delete student (teacher only)"""
        student = await prisma.student.find_unique(where={"id": student_id})
        if not student or student.teacherId != teacher_id:
            return False
        
        await prisma.student.delete(where={"id": student_id})
        return True

# ===================== Prediction Service =====================

class PredictionService:
    
    @staticmethod
    async def create_prediction(
        prisma: Prisma,
        user_id: int,
        prediction_data: PredictionRequest,
        ml_result: dict,
        student_id: Optional[int] = None
    ):
        """Create and store a prediction"""
        prediction = await prisma.prediction.create(
            data={
                "userId": user_id,
                "studentId": student_id,
                "studyHours": prediction_data.study_hours,
                "attendance": prediction_data.attendance,
                "assignmentsScore": prediction_data.assignments_score,
                "pastMarks": prediction_data.past_marks,
                "engagementScore": prediction_data.engagement_score,
                "predictedScore": ml_result['predicted_score'],
                "passFail": ml_result['pass_fail'],
                "riskCategory": ml_result['risk_category'],
                "confidence": ml_result['confidence']
            }
        )
        return prediction
    
    @staticmethod
    async def get_user_predictions(prisma: Prisma, user_id: int, limit: int = 10) -> List:
        """Get predictions for a user"""
        return await prisma.prediction.find_many(
            where={"userId": user_id},
            order={"createdAt": "desc"},
            take=limit
        )
    
    @staticmethod
    async def get_latest_prediction(prisma: Prisma, user_id: int) -> Optional:
        """Get latest prediction for a user"""
        return await prisma.prediction.find_first(
            where={"userId": user_id},
            order={"createdAt": "desc"}
        )
    
    @staticmethod
    async def get_student_predictions(
        prisma: Prisma, student_id: int, limit: int = 10
    ) -> List:
        """Get predictions for a student"""
        return await prisma.prediction.find_many(
            where={"studentId": student_id},
            order={"createdAt": "desc"},
            take=limit
        )
    
    @staticmethod
    async def get_class_predictions(prisma: Prisma, teacher_id: int) -> List:
        """Get all predictions for a teacher's class"""
        # Get all students for this teacher
        students = await prisma.student.find_many(
            where={"teacherId": teacher_id},
            select={"id": True}
        )
        student_ids = [s.id for s in students]
        
        if not student_ids:
            return []
        
        return await prisma.prediction.find_many(
            where={"studentId": {"in": student_ids}},
            order={"createdAt": "desc"}
        )
    
    @staticmethod
    async def get_class_analytics(prisma: Prisma, teacher_id: int) -> ClassAnalytics:
        """Get analytics for a teacher's class"""
        students = await prisma.student.find_many(
            where={"teacherId": teacher_id}
        )
        student_ids = [s.id for s in students]
        
        if not student_ids:
            return ClassAnalytics(
                total_students=0,
                total_predictions=0,
                average_score=0,
                risk_distribution=RiskDistribution(
                    low_risk=0, medium_risk=0, high_risk=0
                ),
                pass_rate=0
            )
        
        # Get latest prediction for each student
        predictions = []
        for student_id in student_ids:
            pred = await prisma.prediction.find_first(
                where={"studentId": student_id},
                order={"createdAt": "desc"}
            )
            if pred:
                predictions.append(pred)
        
        total_predictions = len(predictions)
        
        # Calculate metrics
        if predictions:
            avg_score = sum(p.predictedScore for p in predictions) / len(predictions)
            pass_count = sum(1 for p in predictions if p.passFail == "Pass")
            pass_rate = (pass_count / len(predictions)) * 100
            
            risk_dist = RiskDistribution(
                low_risk=sum(1 for p in predictions if p.riskCategory == "Low"),
                medium_risk=sum(1 for p in predictions if p.riskCategory == "Medium"),
                high_risk=sum(1 for p in predictions if p.riskCategory == "High")
            )
        else:
            avg_score = 0
            pass_rate = 0
            risk_dist = RiskDistribution(low_risk=0, medium_risk=0, high_risk=0)
        
        return ClassAnalytics(
            total_students=len(students),
            total_predictions=total_predictions,
            average_score=round(avg_score, 2),
            risk_distribution=risk_dist,
            pass_rate=round(pass_rate, 2)
        )


from app.services.weekly_tasks import WeeklyTaskService

# ===================== Section Service =====================

class SectionService:
    
    @staticmethod
    async def create_section(prisma: Prisma, teacher_id: int, section: SectionCreate):
        """Create a new section"""
        db_section = await prisma.section.create(
            data={
                "name": section.name.upper(),
                "year": section.year,
                "teacherId": teacher_id
            }
        )
        return db_section
    
    @staticmethod
    async def get_sections_for_teacher(prisma: Prisma, teacher_id: int, year: Optional[int] = None) -> List:
        """Get all sections for a teacher, optionally filtered by year"""
        where = {"teacherId": teacher_id}
        if year is not None:
            where["year"] = year
        
        return await prisma.section.find_many(
            where=where,
            order=[{"year": "asc"}, {"name": "asc"}]
        )
    
    @staticmethod
    async def get_section(prisma: Prisma, section_id: int) -> Optional:
        """Get section by ID"""
        return await prisma.section.find_unique(where={"id": section_id})
    
    @staticmethod
    async def get_section_by_name_and_year(
        prisma: Prisma, teacher_id: int, name: str, year: int
    ) -> Optional:
        """Get section by name and year for a teacher"""
        return await prisma.section.find_first(
            where={
                "teacherId": teacher_id,
                "name": name.upper(),
                "year": year
            }
        )
    
    @staticmethod
    async def update_section(
        prisma: Prisma, section_id: int, teacher_id: int, update: SectionUpdate
    ) -> Optional:
        """Update section (teacher only)"""
        section = await prisma.section.find_unique(where={"id": section_id})
        if not section or section.teacherId != teacher_id:
            return None
        
        update_data = {}
        if update.name:
            update_data["name"] = update.name.upper()
        if update.year is not None:
            update_data["year"] = update.year
        
        if not update_data:
            return section
        
        updated = await prisma.section.update(
            where={"id": section_id},
            data=update_data
        )
        return updated
    
    @staticmethod
    async def delete_section(prisma: Prisma, section_id: int, teacher_id: int) -> bool:
        """Delete section (teacher only)"""
        section = await prisma.section.find_unique(where={"id": section_id})
        if not section or section.teacherId != teacher_id:
            return False
        
        await prisma.section.delete(where={"id": section_id})
        return True

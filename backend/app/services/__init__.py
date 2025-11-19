"""
Business logic services
"""
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional, List
from app.models import User, Student, Prediction
from app.schemas import (
    UserRegister, StudentCreate, StudentUpdate, PredictionRequest,
    RiskDistribution, ClassAnalytics
)
from app.services.security import hash_password, verify_password, create_access_token
from datetime import timedelta

# ===================== User Service =====================

class UserService:
    
    @staticmethod
    def create_user(db: Session, user: UserRegister) -> User:
        """Create a new user"""
        db_user = User(
            email=user.email,
            full_name=user.full_name,
            hashed_password=hash_password(user.password),
            role=user.role
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = UserService.get_user_by_email(db, email)
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user
    
    @staticmethod
    def get_user(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()

# ===================== Student Service =====================

class StudentService:
    
    @staticmethod
    def create_student(db: Session, teacher_id: int, student: StudentCreate) -> Student:
        """Create a new student"""
        db_student = Student(
            student_id=student.student_id,
            name=student.name,
            email=student.email,
            class_name=student.class_name,
            year=student.year,
            section=student.section,
            teacher_id=teacher_id
        )
        db.add(db_student)
        db.commit()
        db.refresh(db_student)
        return db_student
    
    @staticmethod
    def get_students_for_teacher(db: Session, teacher_id: int) -> List[Student]:
        """Get all students for a teacher"""
        return db.query(Student).filter(Student.teacher_id == teacher_id).all()
    
    @staticmethod
    def get_student(db: Session, student_id: int) -> Optional[Student]:
        """Get student by ID"""
        return db.query(Student).filter(Student.id == student_id).first()
    
    @staticmethod
    def update_student(
        db: Session, student_id: int, teacher_id: int, update: StudentUpdate
    ) -> Optional[Student]:
        """Update student (teacher only)"""
        student = db.query(Student).filter(
            Student.id == student_id,
            Student.teacher_id == teacher_id
        ).first()
        
        if not student:
            return None
        
        if update.name:
            student.name = update.name
        if update.email:
            student.email = update.email
        if update.class_name:
            student.class_name = update.class_name
        if getattr(update, 'year', None) is not None:
            student.year = update.year
        if getattr(update, 'section', None) is not None:
            student.section = update.section
        
        db.commit()
        db.refresh(student)
        return student
    
    @staticmethod
    def delete_student(db: Session, student_id: int, teacher_id: int) -> bool:
        """Delete student (teacher only)"""
        student = db.query(Student).filter(
            Student.id == student_id,
            Student.teacher_id == teacher_id
        ).first()
        
        if not student:
            return False
        
        db.delete(student)
        db.commit()
        return True

# ===================== Prediction Service =====================

class PredictionService:
    
    @staticmethod
    def create_prediction(
        db: Session,
        user_id: int,
        prediction_data: PredictionRequest,
        ml_result: dict,
        student_id: Optional[int] = None
    ) -> Prediction:
        """Create and store a prediction"""
        prediction = Prediction(
            user_id=user_id,
            student_id=student_id,
            study_hours=prediction_data.study_hours,
            attendance=prediction_data.attendance,
            assignments_score=prediction_data.assignments_score,
            past_marks=prediction_data.past_marks,
            engagement_score=prediction_data.engagement_score,
            predicted_score=ml_result['predicted_score'],
            pass_fail=ml_result['pass_fail'],
            risk_category=ml_result['risk_category'],
            confidence=ml_result['confidence']
        )
        db.add(prediction)
        db.commit()
        db.refresh(prediction)
        return prediction
    
    @staticmethod
    def get_user_predictions(db: Session, user_id: int, limit: int = 10) -> List[Prediction]:
        """Get predictions for a user"""
        return db.query(Prediction).filter(
            Prediction.user_id == user_id
        ).order_by(desc(Prediction.created_at)).limit(limit).all()
    
    @staticmethod
    def get_latest_prediction(db: Session, user_id: int) -> Optional[Prediction]:
        """Get latest prediction for a user"""
        return db.query(Prediction).filter(
            Prediction.user_id == user_id
        ).order_by(desc(Prediction.created_at)).first()
    
    @staticmethod
    def get_student_predictions(
        db: Session, student_id: int, limit: int = 10
    ) -> List[Prediction]:
        """Get predictions for a student"""
        return db.query(Prediction).filter(
            Prediction.student_id == student_id
        ).order_by(desc(Prediction.created_at)).limit(limit).all()
    
    @staticmethod
    def get_class_predictions(db: Session, teacher_id: int) -> List[Prediction]:
        """Get all predictions for a teacher's class"""
        # Get all students for this teacher
        students = db.query(Student.id).filter(Student.teacher_id == teacher_id).all()
        student_ids = [s[0] for s in students]
        
        if not student_ids:
            return []
        
        return db.query(Prediction).filter(
            Prediction.student_id.in_(student_ids)
        ).order_by(desc(Prediction.created_at)).all()
    
    @staticmethod
    def get_class_analytics(db: Session, teacher_id: int) -> ClassAnalytics:
        """Get analytics for a teacher's class"""
        students = db.query(Student).filter(Student.teacher_id == teacher_id).all()
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
            pred = db.query(Prediction).filter(
                Prediction.student_id == student_id
            ).order_by(desc(Prediction.created_at)).first()
            if pred:
                predictions.append(pred)
        
        total_predictions = len(predictions)
        
        # Calculate metrics
        if predictions:
            avg_score = sum(p.predicted_score for p in predictions) / len(predictions)
            pass_count = sum(1 for p in predictions if p.pass_fail == "Pass")
            pass_rate = (pass_count / len(predictions)) * 100
            
            risk_dist = RiskDistribution(
                low_risk=sum(1 for p in predictions if p.risk_category == "Low"),
                medium_risk=sum(1 for p in predictions if p.risk_category == "Medium"),
                high_risk=sum(1 for p in predictions if p.risk_category == "High")
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

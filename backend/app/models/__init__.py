"""
Database models for User, Student, and Prediction
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    """User model for authentication"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    role = Column(String)  # "student" or "teacher"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    students = relationship("Student", back_populates="teacher")
    predictions = relationship("Prediction", back_populates="user")

class Student(Base):
    """Student model (teacher's view of students)"""
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, unique=True, index=True)  # External ID
    name = Column(String)
    email = Column(String, index=True)
    class_name = Column(String)
    year = Column(Integer, default=1)
    section = Column(String, default='A')
    teacher_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    teacher = relationship("User", back_populates="students")
    predictions = relationship("Prediction", back_populates="student")

class Prediction(Base):
    """Prediction model - stores prediction history"""
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # References
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=True)
    
    # Input features
    study_hours = Column(Float)
    attendance = Column(Float)
    assignments_score = Column(Float)
    past_marks = Column(Float)
    engagement_score = Column(Float)
    
    # Prediction outputs
    predicted_score = Column(Float)
    pass_fail = Column(String)  # "Pass" or "Fail"
    risk_category = Column(String)  # "Low", "Medium", "High"
    confidence = Column(Float)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    user = relationship("User", back_populates="predictions")
    student = relationship("Student", back_populates="predictions")

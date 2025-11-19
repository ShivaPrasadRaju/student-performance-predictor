"""
Database configuration and session management
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Create engine
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    echo=settings.DEBUG
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def seed_demo_users():
    """Create demo users if they don't exist"""
    from app.models import User
    from app.services.security import hash_password
    
    db = SessionLocal()
    try:
        # Check if demo users already exist
        teacher = db.query(User).filter(User.email == "teacher@school.com").first()
        student = db.query(User).filter(User.email == "student@school.com").first()
        
        if not teacher:
            teacher = User(
                email="teacher@school.com",
                full_name="Demo Teacher",
                hashed_password=hash_password("password123"),
                role="teacher",
                is_active=True
            )
            db.add(teacher)
        
        if not student:
            student = User(
                email="student@school.com",
                full_name="Demo Student",
                hashed_password=hash_password("password123"),
                role="student",
                is_active=True
            )
            db.add(student)
        
        db.commit()
        print("✓ Demo users seeded successfully")
    except Exception as e:
        print(f"Note: Could not seed demo users: {e}")
        db.rollback()
    finally:
        db.close()

def init_db():
    """Initialize database tables and seed demo data"""
    Base.metadata.create_all(bind=engine)
    seed_demo_users()

"""
FastAPI application configuration
"""
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Application settings"""
    
    # Database
    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "sqlite:///./student_predictor.db"
    )
    
    # JWT
    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "your-secret-key-change-in-production"
    )
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 30
    
    # API
    API_V1_STR = "/api"
    PROJECT_NAME = "Student Performance Predictor"
    DEBUG = os.getenv("DEBUG", "True") == "True"
    
    # CORS
    ALLOWED_ORIGINS = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

settings = Settings()

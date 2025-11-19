"""
Main FastAPI application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.api import auth, students, predictions, info

# Initialize database
init_db()

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="ML-powered student performance prediction system",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(students.router, prefix=settings.API_V1_STR)
app.include_router(predictions.router, prefix=settings.API_V1_STR)
app.include_router(info.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Student Performance Prediction API",
        "docs": "/docs",
        "openapi": "/openapi.json"
    }

@app.get("/api/health")
def health():
    """Health check"""
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

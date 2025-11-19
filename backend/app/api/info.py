"""
Utility and info routes
"""
from fastapi import APIRouter
import json
import os

router = APIRouter(prefix="/info", tags=["info"])

@router.get("/model")
def get_model_info():
    """Get information about the ML model"""
    model_dir = os.path.join(os.path.dirname(__file__), '../../model')
    model_info_path = os.path.join(model_dir, 'model_info.json')
    
    try:
        with open(model_info_path, 'r') as f:
            model_info = json.load(f)
        return model_info
    except FileNotFoundError:
        return {
            "message": "Model not trained yet. Run 'python model/train.py' to train the model."
        }

@router.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Backend is running"}

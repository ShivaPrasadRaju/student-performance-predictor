import pickle
import json
import os
import numpy as np
from typing import Dict, Tuple

class PredictionEngine:
    """ML model wrapper for making predictions"""
    
    def __init__(self):
        model_dir = os.path.dirname(__file__)
        
        # Load models and scaler
        with open(os.path.join(model_dir, 'model_pipeline.pkl'), 'rb') as f:
            self.pipeline = pickle.load(f)
        
        with open(os.path.join(model_dir, 'scaler.pkl'), 'rb') as f:
            self.scaler = pickle.load(f)
        
        # Load model info
        with open(os.path.join(model_dir, 'model_info.json'), 'r') as f:
            self.model_info = json.load(f)
        
        self.features = self.pipeline['features']
        self.regressor = self.pipeline['regressor']
        self.classifier = self.pipeline['classifier']
    
    def predict(self, data: Dict[str, float]) -> Dict:
        """
        Make a prediction for a student
        
        Args:
            data: Dictionary with keys: study_hours, attendance, assignments_score, 
                  past_marks, engagement_score
        
        Returns:
            Dictionary with predicted_score, pass_fail, risk_category, confidence
        """
        # Extract features in correct order
        feature_values = np.array([data[f] for f in self.features]).reshape(1, -1)
        
        # Validate input ranges
        self._validate_inputs(data)
        
        # Scale features
        feature_values_scaled = self.scaler.transform(feature_values)
        
        # Predict score
        predicted_score = float(self.regressor.predict(feature_values_scaled)[0])
        predicted_score = max(0, min(100, predicted_score))  # Clip to 0-100
        
        # Predict pass/fail
        pass_fail_pred = self.classifier.predict(feature_values_scaled)[0]
        pass_fail = 'Pass' if pass_fail_pred == 1 else 'Fail'
        
        # Get confidence score
        confidence = float(self.classifier.predict_proba(feature_values_scaled)[0].max())
        
        # Determine risk category
        risk_category = self._get_risk_category(predicted_score)
        
        return {
            'predicted_score': round(predicted_score, 2),
            'pass_fail': pass_fail,
            'risk_category': risk_category,
            'confidence': round(confidence, 2),
            'features_used': self.features
        }
    
    def _get_risk_category(self, score: float) -> str:
        """Determine risk category from predicted score"""
        if score >= self.model_info['risk_thresholds']['low_risk']:
            return 'Low'
        elif score >= self.model_info['risk_thresholds']['medium_risk']:
            return 'Medium'
        else:
            return 'High'
    
    def _validate_inputs(self, data: Dict[str, float]) -> None:
        """Validate input data ranges"""
        validations = {
            'study_hours': (0, 24),
            'attendance': (0, 100),
            'assignments_score': (0, 100),
            'past_marks': (0, 100),
            'engagement_score': (0, 10)
        }
        
        for field, (min_val, max_val) in validations.items():
            if field in data:
                value = data[field]
                if not (min_val <= value <= max_val):
                    raise ValueError(
                        f"{field} must be between {min_val} and {max_val}, got {value}"
                    )
    
    def get_model_info(self) -> Dict:
        """Return model information and performance metrics"""
        return self.model_info

# Singleton instance
_engine = None

def get_engine() -> PredictionEngine:
    """Get or create prediction engine instance"""
    global _engine
    if _engine is None:
        _engine = PredictionEngine()
    return _engine

def predict(data: Dict[str, float]) -> Dict:
    """Convenience function for making predictions"""
    engine = get_engine()
    return engine.predict(data)

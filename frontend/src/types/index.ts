// Type definitions
export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'student' | 'teacher';
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Student {
  id: number;
  student_id: string;
  name: string;
  email: string;
  class_name: string;
  year: number;
  section: string;
  created_at: string;
  updated_at: string;
}

export interface Prediction {
  id: number;
  predicted_score: number;
  pass_fail: 'Pass' | 'Fail';
  risk_category: 'Low' | 'Medium' | 'High';
  confidence: number;
  study_hours: number;
  attendance: number;
  assignments_score: number;
  past_marks: number;
  engagement_score: number;
  created_at: string;
}

export interface ClassAnalytics {
  total_students: number;
  total_predictions: number;
  average_score: number;
  risk_distribution: {
    low_risk: number;
    medium_risk: number;
    high_risk: number;
  };
  pass_rate: number;
}

export interface StudentWithLatestPrediction extends Student {
  latest_prediction: Prediction | null;
}

export interface ModelInfo {
  algorithm: string;
  features: string[];
  performance: {
    regression: {
      rmse: number;
      r2_score: number;
      mse: number;
    };
    classification: {
      accuracy: number;
    };
  };
  version: string;
  training_date: string;
}

import axios from 'axios';
import {
  AuthResponse,
  Prediction,
  Student,
  ClassAnalytics,
  StudentWithLatestPrediction,
  ModelInfo,
  WeeklyTaskEntry,
  WeeklyTaskResponse,
  WeeklyTaskSyncRequest,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const authService = {
  register: async (email: string, password: string, fullName: string, role: 'student' | 'teacher'): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/register', {
      email,
      password,
      full_name: fullName,
      role,
    });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },
};

// Student endpoints (teachers)
export const studentService = {
  create: async (student: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> => {
    const response = await api.post('/api/students', student);
    return response.data;
  },

  getAll: async (): Promise<Student[]> => {
    const response = await api.get('/api/students');
    return response.data;
  },

  getOne: async (studentId: number): Promise<Student> => {
    const response = await api.get(`/api/students/${studentId}`);
    return response.data;
  },

  update: async (studentId: number, updates: Partial<Omit<Student, 'id' | 'created_at' | 'updated_at'>>): Promise<Student> => {
    const response = await api.put(`/api/students/${studentId}`, updates);
    return response.data;
  },

  delete: async (studentId: number): Promise<void> => {
    await api.delete(`/api/students/${studentId}`);
  },
};

// Prediction endpoints
export const predictionService = {
  create: async (data: {
    study_hours: number;
    attendance: number;
    assignments_score: number;
    past_marks: number;
    engagement_score: number;
    student_id?: number;
  }): Promise<Prediction> => {
    const response = await api.post('/api/predictions', data);
    return response.data;
  },

  getMyPredictions: async (limit: number = 10): Promise<Prediction[]> => {
    const response = await api.get('/api/predictions/my', { params: { limit } });
    return response.data;
  },

  getLatestPrediction: async (): Promise<Prediction> => {
    const response = await api.get('/api/predictions/my/latest');
    return response.data;
  },

  getStudentPredictions: async (studentId: number, limit: number = 10): Promise<Prediction[]> => {
    const response = await api.get(`/api/predictions/student/${studentId}`, { params: { limit } });
    return response.data;
  },

  getClassAnalytics: async (): Promise<ClassAnalytics> => {
    const response = await api.get('/api/predictions/class/analytics');
    return response.data;
  },

  getClassStudentsOverview: async (): Promise<StudentWithLatestPrediction[]> => {
    const response = await api.get('/api/predictions/class/students-overview');
    return response.data;
  },
};

// Info endpoints
export const infoService = {
  getModelInfo: async (): Promise<ModelInfo> => {
    const response = await api.get('/api/info/model');
    return response.data;
  },

  getHealth: async (): Promise<{ status: string }> => {
    const response = await api.get('/api/health');
    return response.data;
  },
};

export const weeklyTaskService = {
  getWeek: async (weekStart?: string): Promise<WeeklyTaskResponse[]> => {
    const response = await api.get('/api/v1/weekly-tasks', {
      params: weekStart ? { week_start: weekStart } : {},
    });
    return response.data;
  },
  sync: async (payload: WeeklyTaskSyncRequest): Promise<WeeklyTaskResponse[]> => {
    const response = await api.post('/api/v1/weekly-tasks', payload);
    return response.data;
  },
};

export default api;

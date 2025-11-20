import axios from 'axios';
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
    register: async (email, password, fullName, role) => {
        const response = await api.post('/api/auth/register', {
            email,
            password,
            full_name: fullName,
            role,
        });
        return response.data;
    },
    login: async (email, password) => {
        const response = await api.post('/api/auth/login', {
            email,
            password,
        });
        return response.data;
    },
};
// Student endpoints (teachers)
export const studentService = {
    create: async (student) => {
        const response = await api.post('/api/students', student);
        return response.data;
    },
    getAll: async () => {
        const response = await api.get('/api/students');
        return response.data;
    },
    getOne: async (studentId) => {
        const response = await api.get(`/api/students/${studentId}`);
        return response.data;
    },
    update: async (studentId, updates) => {
        const response = await api.put(`/api/students/${studentId}`, updates);
        return response.data;
    },
    delete: async (studentId) => {
        await api.delete(`/api/students/${studentId}`);
    },
};
// Prediction endpoints
export const predictionService = {
    create: async (data) => {
        const response = await api.post('/api/predictions', data);
        return response.data;
    },
    getMyPredictions: async (limit = 10) => {
        const response = await api.get('/api/predictions/my', { params: { limit } });
        return response.data;
    },
    getLatestPrediction: async () => {
        const response = await api.get('/api/predictions/my/latest');
        return response.data;
    },
    getStudentPredictions: async (studentId, limit = 10) => {
        const response = await api.get(`/api/predictions/student/${studentId}`, { params: { limit } });
        return response.data;
    },
    getClassAnalytics: async () => {
        const response = await api.get('/api/predictions/class/analytics');
        return response.data;
    },
    getClassStudentsOverview: async () => {
        const response = await api.get('/api/predictions/class/students-overview');
        return response.data;
    },
};
// Info endpoints
export const infoService = {
    getModelInfo: async () => {
        const response = await api.get('/api/info/model');
        return response.data;
    },
    getHealth: async () => {
        const response = await api.get('/api/health');
        return response.data;
    },
};
export const weeklyTaskService = {
    getWeek: async (weekStart) => {
        const response = await api.get('/api/v1/weekly-tasks', {
            params: weekStart ? { week_start: weekStart } : {},
        });
        return response.data;
    },
    sync: async (payload) => {
        const response = await api.post('/api/v1/weekly-tasks', payload);
        return response.data;
    },
};
export default api;

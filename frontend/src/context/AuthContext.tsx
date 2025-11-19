import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, role: 'student' | 'teacher') => Promise<void>;
  logout: () => void;
  isDemo: boolean;
  setDemoStudent: () => void;
  setDemoTeacher: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    // If no saved user and running in dev, enable demo user by default for testing
    const forceDemo = (import.meta as any).env?.VITE_FORCE_DEMO === 'true' || (import.meta as any).env?.DEV === true;
    if (!savedUser && forceDemo) {
      const demoUser = {
        id: 0,
        email: 'demo@student.com',
        full_name: 'Demo Student',
        role: 'student',
        created_at: new Date().toISOString(),
      } as User;
      setUser(demoUser);
      setToken('demo-token');
      localStorage.setItem('user', JSON.stringify(demoUser));
      localStorage.setItem('token', 'demo-token');
      setIsDemo(true);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response: AuthResponse = await authService.login(email, password);
      setToken(response.access_token);
      setUser(response.user);
      setIsDemo(false);
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response.user;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Login failed';
      setError(message);
      throw err;
    }
  };

  const register = async (email: string, password: string, fullName: string, role: 'student' | 'teacher') => {
    try {
      setError(null);
      const response: AuthResponse = await authService.register(email, password, fullName, role);
      setToken(response.access_token);
      setUser(response.user);
      setIsDemo(false);
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response.user;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Registration failed';
      setError(message);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsDemo(false);
  };

  const [isDemo, setIsDemo] = useState(false);

  const setDemoStudent = () => {
    const demoUser = {
      id: 0,
      email: 'demo@student.com',
      full_name: 'Demo Student',
      role: 'student',
      created_at: new Date().toISOString(),
    } as User;
    setUser(demoUser);
    setToken('demo-token');
    localStorage.setItem('user', JSON.stringify(demoUser));
    localStorage.setItem('token', 'demo-token');
    setIsDemo(true);
  };

  const setDemoTeacher = () => {
    const demoUser = {
      id: 1,
      email: 'demo@teacher.com',
      full_name: 'Demo Teacher',
      role: 'teacher',
      created_at: new Date().toISOString(),
    } as User;
    setUser(demoUser);
    setToken('demo-token');
    localStorage.setItem('user', JSON.stringify(demoUser));
    localStorage.setItem('token', 'demo-token');
    setIsDemo(true);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, isDemo, setDemoStudent, setDemoTeacher }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

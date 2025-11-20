import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Initialize from localStorage
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        // If no saved user and running in dev, enable demo user by default for testing
        const forceDemo = import.meta.env?.VITE_FORCE_DEMO === 'true' || import.meta.env?.DEV === true;
        if (!savedUser && forceDemo) {
            const demoUser = {
                id: 0,
                email: 'demo@student.com',
                full_name: 'Demo Student',
                role: 'student',
                created_at: new Date().toISOString(),
            };
            setUser(demoUser);
            setToken('demo-token');
            localStorage.setItem('user', JSON.stringify(demoUser));
            localStorage.setItem('token', 'demo-token');
            setIsDemo(true);
        }
        setLoading(false);
    }, []);
    const login = async (email, password) => {
        try {
            setError(null);
            const response = await authService.login(email, password);
            setToken(response.access_token);
            setUser(response.user);
            setIsDemo(false);
            localStorage.setItem('token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
            return response.user;
        }
        catch (err) {
            const message = err.response?.data?.detail || 'Login failed';
            setError(message);
            throw err;
        }
    };
    const register = async (email, password, fullName, role) => {
        try {
            setError(null);
            const response = await authService.register(email, password, fullName, role);
            setToken(response.access_token);
            setUser(response.user);
            setIsDemo(false);
            localStorage.setItem('token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
            return response.user;
        }
        catch (err) {
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
        };
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
        };
        setUser(demoUser);
        setToken('demo-token');
        localStorage.setItem('user', JSON.stringify(demoUser));
        localStorage.setItem('token', 'demo-token');
        setIsDemo(true);
    };
    return (_jsx(AuthContext.Provider, { value: { user, token, loading, error, login, register, logout, isDemo, setDemoStudent, setDemoTeacher }, children: children }));
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

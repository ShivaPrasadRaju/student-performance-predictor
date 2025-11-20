import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { AboutPage } from './pages/AboutPage';
import VTUDashboard from './pages/VTUDashboard';
import './index.css';
// Protected Route Component
const ProtectedRoute = ({ children, requiredRole, }) => {
    const { user, loading } = useAuth();
    if (loading) {
        return _jsx("div", { className: "flex items-center justify-center min-h-screen", children: "Loading..." });
    }
    if (!user) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    if (requiredRole && user.role !== requiredRole) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return _jsx(_Fragment, { children: children });
};
// Main App Component
const AppContent = () => {
    const { user } = useAuth();
    // Auto-redirect authenticated users from login/register
    if (user) {
        return (_jsxs(_Fragment, { children: [_jsx(Navbar, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: user.role === 'teacher' ? '/teacher-dashboard' : '/vtu-dashboard', replace: true }) }), _jsx(Route, { path: "/vtu-dashboard", element: _jsx(ProtectedRoute, { requiredRole: "student", children: _jsx(VTUDashboard, {}) }) }), _jsx(Route, { path: "/student-dashboard", element: _jsx(ProtectedRoute, { requiredRole: "student", children: _jsx(StudentDashboard, {}) }) }), _jsx(Route, { path: "/teacher-dashboard", element: _jsx(ProtectedRoute, { requiredRole: "teacher", children: _jsx(TeacherDashboard, {}) }) }), _jsx(Route, { path: "/about", element: _jsx(AboutPage, {}) }), _jsx(Route, { path: "/login", element: _jsx(Navigate, { to: user.role === 'teacher' ? '/teacher-dashboard' : '/vtu-dashboard', replace: true }) }), _jsx(Route, { path: "/register", element: _jsx(Navigate, { to: user.role === 'teacher' ? '/teacher-dashboard' : '/vtu-dashboard', replace: true }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] })] }));
    }
    return (_jsxs(_Fragment, { children: [_jsx(Navbar, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/about", element: _jsx(AboutPage, {}) }), _jsx(Route, { path: "/student-dashboard", element: _jsx(Navigate, { to: "/login", replace: true }) }), _jsx(Route, { path: "/teacher-dashboard", element: _jsx(Navigate, { to: "/login", replace: true }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] })] }));
};
function App() {
    return (_jsx(Router, { children: _jsx(AuthProvider, { children: _jsx(AppContent, {}) }) }));
}
export default App;

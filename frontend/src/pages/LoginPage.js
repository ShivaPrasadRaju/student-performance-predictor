import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, setDemoStudent, setDemoTeacher } = useAuth();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(email, password);
            if (user?.role === 'teacher')
                navigate('/teacher-dashboard');
            else
                navigate('/student-dashboard');
        }
        catch (err) {
            setError('Invalid email or password');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl p-8 w-full max-w-md", children: [_jsx("h2", { className: "text-3xl font-bold text-gray-800 mb-6 text-center", children: "Login" }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4", children: error })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500", placeholder: "you@example.com" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Password" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition", children: loading ? 'Loading...' : 'Login' })] }), _jsxs("div", { className: "mt-6 text-center text-sm text-gray-600", children: ["Don't have an account?", ' ', _jsx("a", { href: "/register", className: "text-primary-600 hover:underline font-semibold", children: "Register here" })] }), _jsxs("div", { className: "mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600", children: [_jsx("p", { className: "font-semibold mb-2", children: "Demo Credentials:" }), _jsx("p", { children: "\uD83D\uDC68\u200D\uD83C\uDFEB Teacher: teacher@school.com / password123" }), _jsx("p", { children: "\uD83D\uDC68\u200D\uD83C\uDF93 Student: student@school.com / password123" })] }), _jsxs("div", { className: "mt-4 flex gap-3", children: [_jsx("button", { onClick: () => { setDemoStudent(); navigate('/student-dashboard'); }, className: "w-1/2 bg-green-500 text-white px-4 py-2 rounded", children: "Enter as Demo Student" }), _jsx("button", { onClick: () => { setDemoTeacher(); navigate('/teacher-dashboard'); }, className: "w-1/2 bg-blue-600 text-white px-4 py-2 rounded", children: "Enter as Demo Teacher" })] })] }) }));
};

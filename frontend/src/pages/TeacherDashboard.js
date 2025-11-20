import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { studentService, predictionService } from '../services/api';
// Small presentational helpers (kept in-file to avoid adding files)
const StatCard = ({ title, value, subtitle, gradient, icon }) => (_jsx("div", { className: `rounded-2xl p-5 shadow-lg transform transition hover:-translate-y-1 ${gradient || 'bg-white'}`, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-100/90 font-semibold", children: title }), _jsx("p", { className: "mt-2 text-2xl font-bold text-white", children: value }), subtitle && _jsx("p", { className: "text-xs text-white/80 mt-1", children: subtitle })] }), _jsx("div", { className: "w-12 h-12 flex items-center justify-center rounded-xl bg-white/20", children: icon })] }) }));
const ProgressBar = ({ value, label }) => (_jsxs("div", { className: "w-full", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [label && _jsx("span", { className: "text-xs text-gray-600", children: label }), _jsxs("span", { className: "text-xs text-gray-600", children: [Math.round(value), "%"] })] }), _jsx("div", { className: "w-full bg-white/20 rounded-full h-3 overflow-hidden", children: _jsx("div", { className: "h-3 bg-gradient-to-r from-green-400 to-blue-500 transition-all", style: { width: `${Math.min(100, Math.max(0, value))}%` } }) })] }));
const Badge = ({ children, tone = 'green' }) => {
    const colors = {
        green: 'bg-green-100 text-green-800',
        yellow: 'bg-yellow-100 text-yellow-800',
        red: 'bg-red-100 text-red-800',
    };
    return _jsx("span", { className: `px-3 py-1 rounded-full text-xs font-semibold ${colors[tone]}`, children: children });
};
export const TeacherDashboard = () => {
    const [students, setStudents] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [filterRisk, setFilterRisk] = useState('all');
    const [year, setYear] = useState(1);
    const [sections, setSections] = useState(['A']);
    const [newSectionName, setNewSectionName] = useState('');
    const [selectedSection, setSelectedSection] = useState('A');
    const [newStudent, setNewStudent] = useState({
        student_id: '',
        name: '',
        email: '',
        class_name: '',
        year: 1,
        section: 'A',
    });
    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        try {
            setLoading(true);
            setError('');
            const [studentsData, analyticsData] = await Promise.all([
                predictionService.getClassStudentsOverview(),
                predictionService.getClassAnalytics(),
            ]);
            // If backend returns nothing, fallback to demo dataset
            if ((!studentsData || studentsData.length === 0) && !analyticsData) {
                const demoStudents = [
                    {
                        id: 101,
                        student_id: 'S101',
                        name: 'Asha Patel',
                        email: 'asha@school.com',
                        class_name: 'CS101',
                        year: 2,
                        section: 'A',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        latest_prediction: {
                            id: 201,
                            predicted_score: 45,
                            pass_fail: 'Fail',
                            risk_category: 'High',
                            confidence: 0.72,
                            study_hours: 2,
                            attendance: 60,
                            assignments_score: 40,
                            past_marks: 50,
                            engagement_score: 3,
                            created_at: new Date().toISOString(),
                        }
                    },
                    {
                        id: 102,
                        student_id: 'S102',
                        name: 'Ravi Kumar',
                        email: 'ravi@school.com',
                        class_name: 'CS101',
                        year: 2,
                        section: 'A',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        latest_prediction: {
                            id: 202,
                            predicted_score: 82,
                            pass_fail: 'Pass',
                            risk_category: 'Low',
                            confidence: 0.9,
                            study_hours: 8,
                            attendance: 95,
                            assignments_score: 88,
                            past_marks: 85,
                            engagement_score: 9,
                            created_at: new Date().toISOString(),
                        }
                    },
                    {
                        id: 103,
                        student_id: 'S103',
                        name: 'Meera Singh',
                        email: 'meera@school.com',
                        class_name: 'CS101',
                        year: 2,
                        section: 'A',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        latest_prediction: {
                            id: 203,
                            predicted_score: 69,
                            pass_fail: 'Pass',
                            risk_category: 'Medium',
                            confidence: 0.78,
                            study_hours: 5,
                            attendance: 82,
                            assignments_score: 70,
                            past_marks: 66,
                            engagement_score: 6,
                            created_at: new Date().toISOString(),
                        }
                    }
                ];
                const demoAnalytics = {
                    total_students: 3,
                    total_predictions: 3,
                    average_score: 65.33,
                    risk_distribution: { low_risk: 1, medium_risk: 1, high_risk: 1 },
                    pass_rate: 66.67,
                };
                setStudents(demoStudents);
                setAnalytics(demoAnalytics);
            }
            else {
                setStudents(studentsData || []);
                setAnalytics(analyticsData || null);
            }
        }
        catch (err) {
            // fallback to demo if backend error
            const demoStudents = [
                {
                    id: 101,
                    student_id: 'S101',
                    name: 'Asha Patel',
                    email: 'asha@school.com',
                    class_name: 'CS101',
                    year: 2,
                    section: 'A',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    latest_prediction: {
                        id: 201,
                        predicted_score: 45,
                        pass_fail: 'Fail',
                        risk_category: 'High',
                        confidence: 0.72,
                        study_hours: 2,
                        attendance: 60,
                        assignments_score: 40,
                        past_marks: 50,
                        engagement_score: 3,
                        created_at: new Date().toISOString(),
                    }
                },
                {
                    id: 102,
                    student_id: 'S102',
                    name: 'Ravi Kumar',
                    email: 'ravi@school.com',
                    class_name: 'CS101',
                    year: 2,
                    section: 'A',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    latest_prediction: {
                        id: 202,
                        predicted_score: 82,
                        pass_fail: 'Pass',
                        risk_category: 'Low',
                        confidence: 0.9,
                        study_hours: 8,
                        attendance: 95,
                        assignments_score: 88,
                        past_marks: 85,
                        engagement_score: 9,
                        created_at: new Date().toISOString(),
                    }
                },
                {
                    id: 103,
                    student_id: 'S103',
                    name: 'Meera Singh',
                    email: 'meera@school.com',
                    class_name: 'CS101',
                    year: 2,
                    section: 'A',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    latest_prediction: {
                        id: 203,
                        predicted_score: 69,
                        pass_fail: 'Pass',
                        risk_category: 'Medium',
                        confidence: 0.78,
                        study_hours: 5,
                        attendance: 82,
                        assignments_score: 70,
                        past_marks: 66,
                        engagement_score: 6,
                        created_at: new Date().toISOString(),
                    }
                }
            ];
            const demoAnalytics = {
                total_students: 3,
                total_predictions: 3,
                average_score: 65.33,
                risk_distribution: { low_risk: 1, medium_risk: 1, high_risk: 1 },
                pass_rate: 66.67,
            };
            setStudents(demoStudents);
            setAnalytics(demoAnalytics);
        }
        finally {
            setLoading(false);
        }
    };
    const addSection = () => {
        const s = newSectionName.trim().toUpperCase();
        if (!s)
            return;
        if (sections.includes(s)) {
            setError('Section already exists');
            return;
        }
        setSections([...sections, s]);
        setSelectedSection(s);
        setNewSectionName('');
    };
    const removeSection = (s) => {
        if (sections.length === 1) {
            setError('Cannot remove the last section');
            return;
        }
        if (!confirm(`Remove section ${s}? This will not delete students automatically.`))
            return;
        const remaining = sections.filter(sec => sec !== s);
        setSections(remaining);
        if (selectedSection === s)
            setSelectedSection(remaining[0]);
    };
    const handleAddStudent = async () => {
        try {
            setError('');
            if (!newStudent.student_id || !newStudent.name || !newStudent.email) {
                setError('Please fill all fields');
                return;
            }
            await studentService.create({
                ...newStudent,
                year,
                section: newStudent.section || selectedSection,
            });
            setNewStudent({ student_id: '', name: '', email: '', class_name: '', year, section: selectedSection });
            setShowAddStudent(false);
            await loadData();
        }
        catch (err) {
            setError('Failed to add student');
        }
    };
    const handleDeleteStudent = async (studentId) => {
        if (confirm('Are you sure you want to delete this student?')) {
            try {
                await studentService.delete(studentId);
                await loadData();
            }
            catch (err) {
                setError('Failed to delete student');
            }
        }
    };
    const filteredStudents = students
        .filter(s => s.year === year && s.section === selectedSection)
        .filter(s => filterRisk === 'all' ? true : s.latest_prediction?.risk_category === filterRisk);
    const getRiskColor = (risk) => {
        switch (risk) {
            case 'Low':
                return 'text-green-700 bg-green-50';
            case 'Medium':
                return 'text-yellow-700 bg-yellow-50';
            case 'High':
                return 'text-red-700 bg-red-50';
            default:
                return 'text-gray-700 bg-gray-50';
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50 py-12 px-4", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-900 mb-2", children: "\uD83D\uDC68\u200D\uD83C\uDFEB Class Dashboard" }), _jsx("p", { className: "text-gray-600 mb-8", children: "Manage students and track class performance" }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6", children: error })), analytics && (_jsxs("div", { className: "grid md:grid-cols-4 gap-4 mb-8", children: [_jsx(StatCard, { title: "Total Students", value: analytics.total_students, subtitle: "Active in selected class", gradient: "bg-gradient-to-r from-indigo-500 to-purple-600", icon: _jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", className: "w-6 h-6 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 11V7a4 4 0 10-8 0v4" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 14v7" })] }) }), _jsx(StatCard, { title: "Average Score", value: analytics.average_score.toFixed(1), subtitle: "Class progress (0-100)", gradient: "bg-gradient-to-r from-green-400 to-blue-500", icon: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "w-6 h-6 text-white", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 17a4 4 0 100-8 4 4 0 000 8z" }) }) }), _jsxs("div", { className: "md:col-span-2 bg-white rounded-2xl p-5 shadow-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: "Class Momentum" }), _jsxs("p", { className: "text-lg font-bold text-gray-900", children: [analytics.average_score.toFixed(1), " / 100"] })] }), _jsx("div", { className: "text-right", children: _jsxs(Badge, { tone: "green", children: ["Pass ", Math.round(analytics.pass_rate), "%"] }) })] }), _jsx("div", { className: "mb-4", children: _jsx(ProgressBar, { value: analytics.average_score, label: "Average Score" }) }), _jsxs("div", { className: "flex gap-3 items-center", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-xs text-gray-500", children: "Predictions" }), _jsx("p", { className: "text-sm font-semibold text-gray-800", children: analytics.total_predictions })] }), _jsx("div", { className: "w-28 h-16 flex items-center justify-center bg-gradient-to-r from-yellow-200 to-pink-200 rounded-lg", children: _jsxs("svg", { viewBox: "0 0 64 64", className: "w-12 h-12", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("circle", { cx: "32", cy: "32", r: "30", fill: "#fff", opacity: "0.2" }), _jsx("path", { d: "M32 12 L39 28 L56 28 L42 36 L48 52 L32 42 L16 52 L22 36 L8 28 L25 28 Z", fill: "#fff", opacity: "0.9" })] }) })] })] })] })), analytics && (_jsxs("div", { className: "bg-white rounded-lg shadow-lg p-6 mb-8", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-4", children: "Risk Distribution" }), _jsxs("div", { className: "grid md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 border border-green-200 flex items-center gap-4", children: [_jsx("div", { className: "p-3 bg-white rounded-lg shadow-sm", children: _jsx("svg", { className: "w-8 h-8 text-green-600", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, children: _jsx("path", { d: "M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7l3-7z" }) }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-700", children: "Low Risk" }), _jsxs("div", { className: "mt-1 flex items-center gap-2", children: [_jsx("p", { className: "text-2xl font-bold text-green-700", children: analytics.risk_distribution.low_risk }), _jsx(Badge, { tone: "green", children: "Good" })] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Students likely to pass \u2014 keep the momentum up" })] })] }), _jsxs("div", { className: "p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 flex items-center gap-4", children: [_jsx("div", { className: "p-3 bg-white rounded-lg shadow-sm", children: _jsx("svg", { className: "w-8 h-8 text-yellow-600", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, children: _jsx("circle", { cx: "12", cy: "12", r: "10" }) }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-700", children: "Medium Risk" }), _jsxs("div", { className: "mt-1 flex items-center gap-2", children: [_jsx("p", { className: "text-2xl font-bold text-yellow-700", children: analytics.risk_distribution.medium_risk }), _jsx(Badge, { tone: "yellow", children: "Monitor" })] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Targeted interventions can improve outcomes" })] })] }), _jsxs("div", { className: "p-4 rounded-lg bg-gradient-to-r from-red-50 to-red-100 border border-red-200 flex items-center gap-4", children: [_jsx("div", { className: "p-3 bg-white rounded-lg shadow-sm", children: _jsxs("svg", { className: "w-8 h-8 text-red-600", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, children: [_jsx("path", { d: "M12 9v4" }), _jsx("path", { d: "M12 17h.01" })] }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-700", children: "High Risk" }), _jsxs("div", { className: "mt-1 flex items-center gap-2", children: [_jsx("p", { className: "text-2xl font-bold text-red-700", children: analytics.risk_distribution.high_risk }), _jsx(Badge, { tone: "red", children: "Action" })] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Consider mentoring and extra practice sessions" })] })] })] })] })), _jsxs("div", { className: "bg-white rounded-lg shadow-lg p-8", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Students" }), _jsxs("div", { className: "flex gap-4 items-center", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { className: "text-sm text-gray-700", children: "Year" }), _jsxs("select", { value: year, onChange: (e) => setYear(Number(e.target.value)), className: "px-3 py-2 border rounded", children: [_jsx("option", { value: 1, children: "1st Year" }), _jsx("option", { value: 2, children: "2nd Year" }), _jsx("option", { value: 3, children: "3rd Year" }), _jsx("option", { value: 4, children: "4th Year" })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { className: "text-sm text-gray-700", children: "Section" }), _jsx("select", { value: selectedSection, onChange: (e) => setSelectedSection(e.target.value), className: "px-3 py-2 border rounded", children: sections.map(s => _jsx("option", { value: s, children: s }, s)) }), _jsx("button", { onClick: () => removeSection(selectedSection), className: "px-3 py-2 bg-red-100 text-red-700 rounded", children: "Remove" }), _jsx("input", { placeholder: "New Section (A)", value: newSectionName, onChange: (e) => setNewSectionName(e.target.value), className: "px-3 py-2 border rounded" }), _jsx("button", { onClick: addSection, className: "px-3 py-2 bg-gray-100 rounded", children: "Add Section" })] }), _jsx("button", { onClick: () => setShowAddStudent(!showAddStudent), className: "bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg", children: showAddStudent ? 'Cancel' : '+ Add Student' })] })] }), showAddStudent && (_jsxs("div", { className: "mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200", children: [_jsxs("div", { className: "grid md:grid-cols-2 gap-4 mb-4", children: [_jsx("input", { type: "text", placeholder: "Student ID", value: newStudent.student_id, onChange: (e) => setNewStudent({ ...newStudent, student_id: e.target.value }), className: "px-4 py-2 border border-gray-300 rounded-lg" }), _jsx("input", { type: "text", placeholder: "Full Name", value: newStudent.name, onChange: (e) => setNewStudent({ ...newStudent, name: e.target.value }), className: "px-4 py-2 border border-gray-300 rounded-lg" }), _jsx("input", { type: "email", placeholder: "Email", value: newStudent.email, onChange: (e) => setNewStudent({ ...newStudent, email: e.target.value }), className: "px-4 py-2 border border-gray-300 rounded-lg" }), _jsx("input", { type: "text", placeholder: "Class Name", value: newStudent.class_name, onChange: (e) => setNewStudent({ ...newStudent, class_name: e.target.value }), className: "px-4 py-2 border border-gray-300 rounded-lg" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { className: "text-sm", children: "Section" }), _jsx("select", { value: newStudent.section, onChange: (e) => setNewStudent({ ...newStudent, section: e.target.value }), className: "px-3 py-2 border rounded", children: sections.map(s => _jsx("option", { value: s, children: s }, s)) })] })] }), _jsx("button", { onClick: handleAddStudent, className: "bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg", children: "Add Student" })] })), _jsxs("div", { className: "mb-6 flex gap-2", children: [_jsx("button", { onClick: () => setFilterRisk('all'), className: `px-4 py-2 rounded-lg ${filterRisk === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`, children: "All" }), _jsx("button", { onClick: () => setFilterRisk('Low'), className: `px-4 py-2 rounded-lg ${filterRisk === 'Low' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`, children: "Low Risk" }), _jsx("button", { onClick: () => setFilterRisk('Medium'), className: `px-4 py-2 rounded-lg ${filterRisk === 'Medium' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700'}`, children: "Medium Risk" }), _jsx("button", { onClick: () => setFilterRisk('High'), className: `px-4 py-2 rounded-lg ${filterRisk === 'High' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`, children: "High Risk" })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 border-b-2 border-gray-200", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left text-sm font-semibold text-gray-900", children: "ID" }), _jsx("th", { className: "px-4 py-3 text-left text-sm font-semibold text-gray-900", children: "Name" }), _jsx("th", { className: "px-4 py-3 text-left text-sm font-semibold text-gray-900", children: "Email" }), _jsx("th", { className: "px-4 py-3 text-left text-sm font-semibold text-gray-900", children: "Class" }), _jsx("th", { className: "px-4 py-3 text-left text-sm font-semibold text-gray-900", children: "Year" }), _jsx("th", { className: "px-4 py-3 text-left text-sm font-semibold text-gray-900", children: "Section" }), _jsx("th", { className: "px-4 py-3 text-left text-sm font-semibold text-gray-900", children: "Latest Score" }), _jsx("th", { className: "px-4 py-3 text-left text-sm font-semibold text-gray-900", children: "Risk" }), _jsx("th", { className: "px-4 py-3 text-left text-sm font-semibold text-gray-900", children: "Status" }), _jsx("th", { className: "px-4 py-3 text-left text-sm font-semibold text-gray-900", children: "Action" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200", children: filteredStudents.map((student) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-4 py-3 text-sm text-gray-900", children: student.student_id }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-900 font-medium", children: student.name }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-600", children: student.email }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-600", children: student.class_name }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-600", children: student.year }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-600", children: student.section }), _jsx("td", { className: "px-4 py-3 text-sm", children: student.latest_prediction ? (_jsx("span", { className: "font-bold text-primary-600", children: student.latest_prediction.predicted_score })) : (_jsx("span", { className: "text-gray-500", children: "-" })) }), _jsx("td", { className: "px-4 py-3 text-sm", children: student.latest_prediction ? (_jsx("span", { className: `px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(student.latest_prediction.risk_category)}`, children: student.latest_prediction.risk_category })) : (_jsx("span", { className: "text-gray-500", children: "-" })) }), _jsx("td", { className: "px-4 py-3 text-sm", children: student.latest_prediction && (_jsx("span", { className: `px-3 py-1 rounded-full text-xs font-semibold ${student.latest_prediction.pass_fail === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`, children: student.latest_prediction.pass_fail })) }), _jsx("td", { className: "px-4 py-3 text-sm", children: _jsx("button", { onClick: () => handleDeleteStudent(student.id), className: "text-red-600 hover:text-red-900", children: "Delete" }) })] }, student.id))) })] }) }), filteredStudents.length === 0 && (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No students found" }))] }), loading && _jsx("div", { className: "text-center text-gray-600", children: "Loading..." })] }) }));
};

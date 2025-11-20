import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
export default function VTUDashboard() {
    const { user, token } = useAuth();
    const [selectedSemester, setSelectedSemester] = useState(3);
    const [semesterData, setSemesterData] = useState(null);
    const [subjectMarks, setSubjectMarks] = useState({});
    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [activeTab, setActiveTab] = useState('marks');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    // Load semester subjects when semester changes
    useEffect(() => {
        const loadSemesterSubjects = async () => {
            if (!token)
                return;
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/api/v1/vtu/semesters/${selectedSemester}/subjects`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSemesterData(response.data);
                // Initialize marks to 0
                const marks = {};
                response.data.subjects.forEach((subject) => {
                    marks[subject.code] = 0;
                });
                setSubjectMarks(marks);
            }
            catch (error) {
                console.error('Error loading semester subjects:', error);
            }
            finally {
                setLoading(false);
            }
        };
        loadSemesterSubjects();
    }, [selectedSemester, token]);
    // Handle mark change via slider/input
    const handleMarkChange = (subjectCode, value) => {
        setSubjectMarks({
            ...subjectMarks,
            [subjectCode]: Math.min(100, Math.max(0, value)),
        });
    };
    // Submit marks
    const handleSubmitMarks = async () => {
        if (!token || !semesterData)
            return;
        try {
            setLoading(true);
            const marksData = semesterData.subjects.map((subject) => ({
                subject_code: subject.code,
                subject_name: subject.name,
                subject_type: subject.type,
                marks: subjectMarks[subject.code] || 0,
                credits: subject.credits,
                weightage: subject.weightage,
            }));
            await axios.post(`${API_URL}/api/v1/vtu/marks/submit`, {
                semester: selectedSemester,
                subject_marks: marksData,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Marks submitted successfully!');
        }
        catch (error) {
            console.error('Error submitting marks:', error);
            alert('Failed to submit marks');
        }
        finally {
            setLoading(false);
        }
    };
    // Generate prediction
    const handleGeneratePrediction = async () => {
        if (!token)
            return;
        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/api/v1/vtu/prediction/generate`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPrediction(response.data);
            setActiveTab('prediction');
        }
        catch (error) {
            console.error('Error generating prediction:', error);
            alert('Failed to generate prediction. Make sure marks are submitted first.');
        }
        finally {
            setLoading(false);
        }
    };
    const getRiskColor = (risk) => {
        if (risk === 'Low')
            return 'bg-green-100 text-green-800';
        if (risk === 'Medium')
            return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };
    const getStatusColor = (status) => {
        if (status === 'Good')
            return 'bg-green-500';
        if (status === 'Moderate')
            return 'bg-yellow-500';
        return 'bg-red-500';
    };
    const getMarkColor = (mark) => {
        if (mark >= 75)
            return 'text-green-600';
        if (mark >= 60)
            return 'text-yellow-600';
        if (mark >= 40)
            return 'text-orange-600';
        return 'text-red-600';
    };
    if (!user) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: _jsx("p", { className: "text-gray-600", children: "Please log in to access the VTU Dashboard" }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6", children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-800 mb-2", children: "\uD83D\uDCDA VTU Performance Predictor" }), _jsxs("p", { className: "text-gray-600", children: ["Semester ", selectedSemester, " - Input your subject marks to get AI-powered predictions"] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6 mb-6", children: [_jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-4", children: "Select Semester" }), _jsx("div", { className: "flex flex-wrap gap-2", children: [1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (_jsxs("button", { onClick: () => setSelectedSemester(sem), className: `px-4 py-2 rounded-lg font-semibold transition-all ${selectedSemester === sem
                                    ? 'bg-indigo-600 text-white shadow-lg scale-105'
                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`, children: ["Sem ", sem] }, sem))) }), semesterData && (_jsxs("p", { className: "text-sm text-gray-600 mt-4", children: ["\uD83D\uDCD6 ", semesterData.name] }))] }), _jsxs("div", { className: "flex gap-4 mb-6", children: [_jsx("button", { onClick: () => setActiveTab('marks'), className: `px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'marks'
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-100'}`, children: "\uD83D\uDCDD Add Marks" }), _jsx("button", { onClick: () => setActiveTab('prediction'), disabled: !prediction, className: `px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'prediction'
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : prediction
                                    ? 'bg-white text-gray-700 hover:bg-gray-100'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`, children: "\uD83C\uDFAF Prediction" }), _jsx("button", { onClick: () => setActiveTab('schedule'), disabled: !prediction, className: `px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'schedule'
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : prediction
                                    ? 'bg-white text-gray-700 hover:bg-gray-100'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`, children: "\uD83D\uDCC5 Study Plan" })] }), activeTab === 'marks' && (_jsxs("div", { className: "bg-white rounded-lg shadow-lg p-8", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-6", children: "\uD83D\uDCCA Add Subject Marks" }), loading ? (_jsx("div", { className: "flex justify-center items-center py-12", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" }) })) : semesterData ? (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: semesterData.subjects.map((subject) => {
                                        const mark = subjectMarks[subject.code] || 0;
                                        return (_jsxs("div", { className: "bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 border-2 border-gray-200 hover:border-indigo-300 transition-all", children: [_jsxs("div", { className: "flex justify-between items-start mb-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold text-gray-800", children: subject.name }), _jsxs("div", { className: "flex gap-2 mt-1", children: [_jsx("span", { className: "text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded", children: subject.type }), _jsxs("span", { className: "text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded", children: [subject.credits, " credits"] }), _jsx("span", { className: "text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded", children: subject.code })] })] }), _jsx("div", { className: `text-3xl font-bold ${getMarkColor(mark)}`, children: mark })] }), _jsx("input", { type: "range", min: "0", max: "100", value: mark, onChange: (e) => handleMarkChange(subject.code, parseInt(e.target.value)), className: "w-full h-3 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-indigo-600" }), _jsxs("div", { className: "flex items-center gap-2 mt-3", children: [_jsx("input", { type: "number", min: "0", max: "100", value: mark, onChange: (e) => handleMarkChange(subject.code, parseInt(e.target.value) || 0), className: "w-20 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 text-center font-semibold" }), _jsx("span", { className: "text-sm text-gray-600", children: "/ 100" })] }), _jsxs("div", { className: "mt-3", children: [mark >= 75 && (_jsx("span", { className: `text-sm font-semibold px-3 py-1 rounded ${getRiskColor('Low')}`, children: "\u2705 Low Risk" })), mark >= 60 && mark < 75 && (_jsx("span", { className: `text-sm font-semibold px-3 py-1 rounded ${getRiskColor('Medium')}`, children: "\u26A0\uFE0F Medium Risk" })), mark < 60 && mark >= 40 && (_jsx("span", { className: `text-sm font-semibold px-3 py-1 rounded ${getRiskColor('High')}`, children: "\uD83D\uDD34 High Risk" })), mark < 40 && (_jsx("span", { className: `text-sm font-semibold px-3 py-1 rounded bg-red-200 text-red-800`, children: "\u274C Backlog Risk" }))] })] }, subject.code));
                                    }) }), _jsxs("div", { className: "flex gap-4 pt-6 border-t-2 border-gray-200", children: [_jsx("button", { onClick: handleSubmitMarks, disabled: loading, className: "flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:bg-gray-400 transition-all shadow-md", children: "\uD83D\uDCBE Save Marks" }), _jsx("button", { onClick: handleGeneratePrediction, disabled: loading, className: "flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 transition-all shadow-md", children: "\uD83C\uDFAF Generate Prediction" })] })] })) : (_jsx("p", { className: "text-gray-600", children: "Loading semester data..." }))] })), activeTab === 'prediction' && prediction && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: `${getStatusColor(prediction.academic_status)} rounded-lg shadow-lg p-8 text-white`, children: [_jsx("h2", { className: "text-3xl font-bold mb-4", children: "\uD83C\uDF93 Academic Status" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: [_jsxs("div", { className: "bg-white bg-opacity-20 rounded-lg p-4", children: [_jsx("p", { className: "text-sm opacity-90", children: "Status" }), _jsx("p", { className: "text-2xl font-bold", children: prediction.academic_status })] }), _jsxs("div", { className: "bg-white bg-opacity-20 rounded-lg p-4", children: [_jsx("p", { className: "text-sm opacity-90", children: "SGPA" }), _jsx("p", { className: "text-2xl font-bold", children: prediction.sgpa.toFixed(2) })] }), _jsxs("div", { className: "bg-white bg-opacity-20 rounded-lg p-4", children: [_jsx("p", { className: "text-sm opacity-90", children: "Est. CGPA" }), _jsx("p", { className: "text-2xl font-bold", children: prediction.estimated_cgpa.toFixed(2) })] }), _jsxs("div", { className: "bg-white bg-opacity-20 rounded-lg p-4", children: [_jsx("p", { className: "text-sm opacity-90", children: "Backlog Risk" }), _jsx("p", { className: "text-2xl font-bold", children: prediction.backlog_risk })] })] })] }), prediction.backlog_subjects.length > 0 && (_jsxs("div", { className: "bg-red-50 rounded-lg shadow-lg p-8 border-2 border-red-200", children: [_jsx("h3", { className: "text-2xl font-bold text-red-800 mb-4", children: "\u26A0\uFE0F Subjects at Backlog Risk" }), _jsx("div", { className: "space-y-3", children: prediction.backlog_subjects.map((subject, idx) => (_jsxs("div", { className: "bg-white rounded-lg p-4 flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("p", { className: "font-bold text-gray-800", children: subject.name }), _jsxs("p", { className: "text-sm text-gray-600", children: [subject.code, " (", subject.type, ")"] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-2xl font-bold text-red-600", children: subject.marks }), _jsx("p", { className: "text-xs text-gray-600", children: "marks" })] })] }, idx))) })] })), _jsxs("div", { className: "bg-white rounded-lg shadow-lg p-8", children: [_jsx("h3", { className: "text-2xl font-bold text-gray-800 mb-6", children: "\uD83D\uDCCA Performance Metrics" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6", children: [_jsx("h4", { className: "font-bold text-gray-800 mb-3", children: "Test Consistency" }), _jsx("div", { className: "w-full bg-gray-300 rounded-full h-4", children: _jsx("div", { className: "bg-blue-600 h-4 rounded-full transition-all", style: { width: `${prediction.test_consistency}%` } }) }), _jsxs("p", { className: "text-sm text-gray-700 mt-2", children: [prediction.test_consistency.toFixed(1), "%"] })] }), _jsxs("div", { className: "bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6", children: [_jsx("h4", { className: "font-bold text-gray-800 mb-3", children: "Improvement Trend" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: prediction.improvement_trend }), _jsx("p", { className: "text-sm text-gray-700 mt-2", children: prediction.improvement_trend === 'Improving'
                                                        ? '📈 Your performance is getting better!'
                                                        : prediction.improvement_trend === 'Declining'
                                                            ? '📉 Consider focusing on weak areas'
                                                            : '➡️ Keep maintaining consistency' })] })] })] }), prediction.recommendation_plan && (_jsxs("div", { className: "bg-white rounded-lg shadow-lg p-8", children: [_jsx("h3", { className: "text-2xl font-bold text-gray-800 mb-6", children: "\uD83D\uDCA1 Recommendations" }), prediction.recommendation_plan.focus_areas && prediction.recommendation_plan.focus_areas.length > 0 && (_jsxs("div", { className: "mb-6", children: [_jsx("h4", { className: "font-bold text-gray-800 mb-3", children: "\uD83C\uDFAF Focus Areas" }), _jsx("ul", { className: "space-y-2", children: prediction.recommendation_plan.focus_areas.map((area, idx) => (_jsxs("li", { className: "flex items-start gap-2 text-gray-700", children: [_jsx("span", { className: "text-xl", children: "\u2713" }), _jsx("span", { children: area })] }, idx))) })] })), prediction.recommendation_plan.weak_subjects && prediction.recommendation_plan.weak_subjects.length > 0 && (_jsxs("div", { className: "mb-6", children: [_jsx("h4", { className: "font-bold text-gray-800 mb-3", children: "\uD83D\uDCDA Weak Subjects (Top 3)" }), _jsx("div", { className: "space-y-3", children: prediction.recommendation_plan.weak_subjects.map((subject, idx) => (_jsxs("div", { className: "bg-yellow-50 rounded-lg p-4", children: [_jsx("p", { className: "font-bold text-gray-800", children: subject.name }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Current: ", subject.marks, " | Risk: ", subject.risk] })] }, idx))) })] })), prediction.recommendation_plan.daily_tasks && prediction.recommendation_plan.daily_tasks.length > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "font-bold text-gray-800 mb-3", children: "\uD83D\uDCCB Suggested Daily Tasks" }), _jsx("div", { className: "space-y-3", children: prediction.recommendation_plan.daily_tasks.map((task, idx) => (_jsxs("div", { className: "bg-blue-50 rounded-lg p-4", children: [_jsxs("p", { className: "font-bold text-gray-800", children: [task.day, ": ", task.subject] }), _jsx("p", { className: "text-sm text-gray-700", children: task.task }), _jsxs("p", { className: "text-xs text-gray-600 mt-1", children: ["\u23F1\uFE0F ", task.duration_minutes, " min | Difficulty: ", task.difficulty] })] }, idx))) })] }))] }))] })), activeTab === 'schedule' && prediction && prediction.study_schedule && (_jsxs("div", { className: "bg-white rounded-lg shadow-lg p-8", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-6", children: "\uD83D\uDCC5 AI-Generated Study Schedule" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-8", children: [_jsxs("div", { className: "bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6", children: [_jsx("h4", { className: "font-bold text-gray-800 mb-2", children: "Improvement Trend" }), _jsx("p", { className: "text-2xl font-bold text-purple-600", children: prediction.study_schedule.improvement_trend })] }), _jsxs("div", { className: "bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6", children: [_jsx("h4", { className: "font-bold text-gray-800 mb-2", children: "Consistency Score" }), _jsxs("p", { className: "text-2xl font-bold text-indigo-600", children: [prediction.study_schedule.consistency_score.toFixed(1), "%"] })] })] }), prediction.study_schedule.weekly_schedule && (_jsxs("div", { className: "mb-8", children: [_jsx("h3", { className: "text-xl font-bold text-gray-800 mb-4", children: "\uD83D\uDCC6 Weekly Schedule" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: Object.entries(prediction.study_schedule.weekly_schedule).map(([day, activity]) => (_jsxs("div", { className: "bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4", children: [_jsx("p", { className: "font-bold text-gray-800 capitalize", children: day }), _jsx("p", { className: "text-sm text-gray-700 mt-2", children: String(activity) })] }, day))) })] })), prediction.study_schedule.milestones && (_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold text-gray-800 mb-4", children: "\uD83C\uDFC6 Milestones (4-Week Plan)" }), _jsx("div", { className: "space-y-3", children: prediction.study_schedule.milestones.map((milestone, idx) => (_jsxs("div", { className: "flex items-start gap-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4", children: [_jsx("span", { className: "text-2xl font-bold text-green-600", children: idx + 1 }), _jsx("p", { className: "text-gray-800 pt-1", children: milestone })] }, idx))) })] }))] }))] }) }));
}

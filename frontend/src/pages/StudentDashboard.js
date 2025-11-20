import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { weeklyTaskService } from '../services/api';
const FIRST_YEAR_SUBJECTS = [
    'Engineering Mathematics I',
    'Engineering Mathematics II',
    'Engineering Physics',
    'Engineering Chemistry',
    'Basic Electrical & Electronics Engineering',
    'Programming in C',
    'Workshop / Manufacturing Practices',
    'Engineering Graphics',
    'Environmental Science & Engineering',
    'Professional Communication & Ethics',
];
const CSE_CORE_SUBJECTS = [
    'Data Structures',
    'Computer Organization',
    'Discrete Mathematics',
    'Object Oriented Programming',
    'Design and Analysis of Algorithms',
    'Operating Systems',
    'Database Management Systems',
    'Computer Networks',
    'Software Engineering',
    'Theory of Computation',
    'Compiler Design',
    'Artificial Intelligence / Machine Learning (elective)',
    'Mobile Application Development',
];
const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const buildInitialTasks = () => WEEK_DAYS.map((day) => ({
    day,
    task: '',
    completed: false,
}));
const buildInitialMarks = (subjects) => subjects.reduce((acc, subject) => {
    acc[subject] = 75;
    return acc;
}, {});
const getWeekStart = (reference = new Date()) => {
    const dayIndex = reference.getDay();
    const offset = (dayIndex + 6) % 7;
    const weekStart = new Date(reference);
    weekStart.setDate(reference.getDate() - offset);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
};
const formatDate = (date) => date.toISOString().split('T')[0];
export const StudentDashboard = () => {
    const [selectedSemester, setSelectedSemester] = useState(1);
    const [subjectMarks, setSubjectMarks] = useState(buildInitialMarks(FIRST_YEAR_SUBJECTS));
    const [weeklyTasks, setWeeklyTasks] = useState(buildInitialTasks());
    const [weekStart, setWeekStart] = useState(() => formatDate(getWeekStart()));
    const [performanceInputs, setPerformanceInputs] = useState({
        studyHours: 6,
        attendance: 85,
        assignmentsScore: 80,
        pastMarks: 75,
        engagementScore: 7,
    });
    const completedTasks = useMemo(() => {
        return weeklyTasks.reduce((acc, task) => {
            acc[task.day] = task.completed;
            return acc;
        }, {});
    }, [weeklyTasks]);
    const subjectList = useMemo(() => {
        return selectedSemester <= 2 ? FIRST_YEAR_SUBJECTS : CSE_CORE_SUBJECTS;
    }, [selectedSemester]);
    useEffect(() => {
        setSubjectMarks((prev) => {
            const nextMarks = { ...prev };
            subjectList.forEach((subject) => {
                if (!(subject in nextMarks)) {
                    nextMarks[subject] = 75;
                }
            });
            Object.keys(nextMarks).forEach((subject) => {
                if (!subjectList.includes(subject)) {
                    delete nextMarks[subject];
                }
            });
            return nextMarks;
        });
    }, [subjectList]);
    useEffect(() => {
        const loadTasks = async () => {
            try {
                const tasks = await weeklyTaskService.getWeek(weekStart);
                const merged = WEEK_DAYS.map((day) => {
                    const existing = tasks.find((task) => task.day === day);
                    return {
                        day,
                        task: existing?.task || '',
                        completed: existing?.completed || false,
                    };
                });
                setWeeklyTasks(merged);
            }
            catch (err) {
                console.error('Unable to load weekly tasks', err);
            }
        };
        loadTasks();
    }, [weekStart]);
    const longestStreak = useMemo(() => {
        let streak = 0;
        let longest = 0;
        WEEK_DAYS.forEach((day) => {
            if (completedTasks[day]) {
                streak += 1;
                longest = Math.max(longest, streak);
            }
            else {
                streak = 0;
            }
        });
        return longest;
    }, [completedTasks]);
    const completionPercent = useMemo(() => {
        const done = WEEK_DAYS.filter((day) => completedTasks[day]).length;
        return Math.round((done / WEEK_DAYS.length) * 100);
    }, [completedTasks]);
    const averageMark = useMemo(() => {
        const total = subjectList.reduce((sum, subject) => sum + (subjectMarks[subject] || 0), 0);
        return subjectList.length ? Math.round(total / subjectList.length) : 0;
    }, [subjectList, subjectMarks]);
    const backlogSubjects = subjectList.filter((subject) => (subjectMarks[subject] || 0) < 40);
    const dailyReminder = useMemo(() => {
        const upcoming = weeklyTasks.find((task) => task.task.trim() && !completedTasks[task.day]);
        if (upcoming) {
            return `${upcoming.day}: ${upcoming.task}`;
        }
        const anyTask = weeklyTasks.find((task) => task.task.trim());
        return anyTask ? 'All tasks are tracked. Keep the streak alive!' : 'Add weekly tasks to get daily reminders.';
    }, [weeklyTasks, completedTasks]);
    const performanceScore = useMemo(() => {
        const markContribution = averageMark / 100;
        const streakContribution = Math.min(longestStreak / 7, 1);
        const taskContribution = completionPercent / 100;
        return Math.round((markContribution * 0.6 + streakContribution * 0.25 + taskContribution * 0.15) * 100);
    }, [averageMark, longestStreak, completionPercent]);
    const handleMarkChange = (subject, value) => {
        setSubjectMarks((prev) => ({
            ...prev,
            [subject]: Math.max(0, Math.min(100, value)),
        }));
    };
    const handleTaskUpdate = (day, value) => {
        setWeeklyTasks((prev) => prev.map((task) => (task.day === day ? { ...task, task: value } : task)));
    };
    const toggleTaskCompletion = (day) => {
        setWeeklyTasks((prev) => prev.map((task) => (task.day === day ? { ...task, completed: !task.completed } : task)));
    };
    const handleSaveTasks = async () => {
        try {
            await weeklyTaskService.sync({
                week_start: weekStart,
                entries: weeklyTasks.map(({ day, task, completed }) => ({ day, task, completed })),
            });
            alert('Weekly tasks saved');
        }
        catch (err) {
            console.error('Failed to save tasks', err);
            alert('Unable to save tasks. Please try again.');
        }
    };
    const handlePerformanceInputChange = (key, value) => {
        setPerformanceInputs((prev) => ({
            ...prev,
            [key]: Math.max(0, Math.min(key === 'engagementScore' ? 10 : key === 'studyHours' ? 24 : 100, value)),
        }));
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4", children: _jsxs("div", { className: "max-w-6xl mx-auto space-y-8", children: [_jsxs("header", { className: "space-y-2 text-center", children: [_jsx("p", { className: "text-sm uppercase tracking-wider text-indigo-500", children: "VTU Scheme \u00B7 AI Insights" }), _jsx("h1", { className: "text-4xl font-bold text-slate-900", children: "\uD83D\uDCCA My Dashboard" }), _jsx("p", { className: "text-lg text-slate-600", children: "Track semester marks, log weekly to-dos, and let your streaks fuel the AI predictor." })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[250px,1fr] gap-6", children: [_jsxs("div", { className: "bg-white rounded-2xl shadow-xl p-5 border border-slate-200", children: [_jsx("h2", { className: "text-lg font-semibold text-slate-800 mb-3", children: "Semester Selector" }), _jsx("select", { value: selectedSemester, onChange: (e) => setSelectedSemester(Number(e.target.value)), className: "w-full px-4 py-3 border rounded-xl border-slate-300 focus:border-indigo-500 focus:outline-none", children: [...Array(8)].map((_, idx) => (_jsxs("option", { value: idx + 1, children: ["Semester ", idx + 1] }, idx + 1))) }), _jsx("p", { className: "text-sm text-slate-500 mt-3", children: selectedSemester <= 2
                                        ? 'First year foundation subjects for Semesters 1 & 2'
                                        : 'Core CSE subjects aligned to Semesters 3–8' })] }), _jsxs("div", { className: "bg-white rounded-2xl shadow-xl p-6 border border-slate-200 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold text-slate-800", children: "Performance Snapshot" }), _jsx("span", { className: "text-sm text-slate-500", children: "Score" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-slate-50 rounded-xl p-4 border border-slate-100", children: [_jsx("p", { className: "text-xs uppercase tracking-wide text-slate-500", children: "Avg Marks" }), _jsx("p", { className: "text-3xl font-bold text-slate-900", children: averageMark }), _jsx("p", { className: "text-sm text-slate-500", children: "subject-weighted" })] }), _jsxs("div", { className: "bg-slate-50 rounded-xl p-4 border border-slate-100", children: [_jsx("p", { className: "text-xs uppercase tracking-wide text-slate-500", children: "Backlog Risk" }), _jsx("p", { className: "text-3xl font-bold text-red-600", children: backlogSubjects.length }), _jsx("p", { className: "text-sm text-slate-500", children: "subjects under 40" })] }), _jsxs("div", { className: "bg-slate-50 rounded-xl p-4 border border-slate-100", children: [_jsx("p", { className: "text-xs uppercase tracking-wide text-slate-500", children: "Daily Streak" }), _jsx("p", { className: "text-3xl font-bold text-indigo-600", children: longestStreak }), _jsx("p", { className: "text-sm text-slate-500", children: "days running" })] }), _jsxs("div", { className: "bg-slate-50 rounded-xl p-4 border border-slate-100", children: [_jsx("p", { className: "text-xs uppercase tracking-wide text-slate-500", children: "Task Completion" }), _jsxs("p", { className: "text-3xl font-bold text-emerald-600", children: [completionPercent, "%"] }), _jsx("p", { className: "text-sm text-slate-500", children: "weekly reminder" })] })] }), _jsxs("div", { className: "rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-wide", children: "Prediction Performance" }), _jsx("p", { className: "text-4xl font-bold", children: performanceScore }), _jsx("p", { className: "text-sm opacity-80", children: "Based on marks, streak, and weekly tasks" })] })] })] }), _jsxs("section", { className: "bg-white rounded-3xl shadow-2xl p-8 border border-slate-200 space-y-6", children: [_jsxs("header", { className: "flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm uppercase tracking-wider text-indigo-500 font-semibold", children: "To Do List" }), _jsx("h2", { className: "text-2xl font-bold text-slate-900", children: "Weekly plan + reminders" }), _jsx("p", { className: "text-sm text-slate-500", children: "Save your week\u2019s focus areas and keep the streak rolling." })] }), _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:gap-3", children: [_jsx("label", { className: "text-xs text-slate-500 uppercase tracking-wide", children: "Week start" }), _jsx("input", { type: "date", value: weekStart, onChange: (e) => setWeekStart(e.target.value), className: "rounded-xl border border-slate-200 px-3 py-2 text-sm" }), _jsx("button", { onClick: handleSaveTasks, className: "rounded-xl bg-indigo-600 text-white px-4 py-2 text-sm font-semibold shadow-lg hover:bg-indigo-700 transition", children: "Save Weekly Tasks" })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: weeklyTasks.map(({ day, task, completed }) => (_jsxs("div", { className: "border border-slate-100 rounded-2xl p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("p", { className: "font-semibold text-slate-800", children: day }), _jsx("button", { onClick: () => toggleTaskCompletion(day), className: `text-xs px-3 py-1 rounded-full border ${completed ? 'border-emerald-500 text-emerald-500' : 'border-slate-300 text-slate-500'}`, children: completed ? 'Done' : 'Mark' })] }), _jsx("textarea", { value: task, placeholder: "Describe focus for the day", onChange: (e) => handleTaskUpdate(day, e.target.value), rows: 3, className: "w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" })] }, day))) }), _jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "rounded-2xl bg-slate-50 p-4 border border-slate-100", children: [_jsx("p", { className: "text-xs uppercase tracking-wide text-slate-500", children: "Daily reminder" }), _jsx("p", { className: "text-lg font-semibold text-slate-900 mt-1", children: dailyReminder }), _jsxs("p", { className: "text-sm text-slate-500 mt-1", children: ["Streak: ", longestStreak, " days \u00B7 Completed ", completionPercent, "%"] })] }), _jsxs("div", { className: "rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-2", children: [_jsx("p", { className: "text-xs uppercase tracking-wide text-slate-500", children: "Saved activities" }), weeklyTasks.filter((t) => t.task.trim()).length === 0 ? (_jsx("p", { className: "text-sm text-slate-500", children: "No activities saved yet." })) : (_jsx("ul", { className: "space-y-1 text-sm text-slate-700", children: weeklyTasks
                                                .filter((t) => t.task.trim())
                                                .map((t) => (_jsxs("li", { className: "flex items-center justify-between", children: [_jsx("span", { children: t.day }), _jsx("span", { className: `text-xs font-semibold ${t.completed ? 'text-emerald-600' : 'text-yellow-600'}`, children: t.completed ? 'Done' : 'Pending' })] }, t.day))) }))] })] })] }), _jsxs("section", { className: "bg-white rounded-3xl shadow-2xl p-8 border border-slate-200 space-y-6", children: [_jsxs("header", { children: [_jsx("p", { className: "text-sm uppercase tracking-wide text-indigo-500", children: "Prediction Criteria" }), _jsx("h2", { className: "text-2xl font-bold text-slate-900", children: "Qualities that influence predictions" }), _jsx("p", { className: "text-sm text-slate-500", children: "Adjust these metrics to understand how your performance profile shifts." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
                                { key: 'studyHours', label: 'Study Hours', max: 24 },
                                { key: 'attendance', label: 'Attendance (%)', max: 100 },
                            ].map(({ key, label, max }) => (_jsxs("div", { className: "border border-slate-100 rounded-2xl p-4 bg-slate-50 space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-sm font-semibold text-slate-700", children: label }), _jsxs("span", { className: "text-xs text-slate-500", children: [performanceInputs[key], key === 'studyHours' ? ' hrs/day' : '%'] })] }), _jsx("input", { type: "range", min: "0", max: max, value: performanceInputs[key], onChange: (e) => handlePerformanceInputChange(key, Number(e.target.value)), className: "w-full h-2 accent-indigo-600" })] }, key))) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
                                { key: 'assignmentsScore', label: 'Assignments Score' },
                                { key: 'pastMarks', label: 'Past Marks' },
                                { key: 'engagementScore', label: 'Engagement (1-10)' },
                            ].map(({ key, label }) => (_jsxs("div", { className: "border border-slate-100 rounded-2xl p-4 bg-slate-50", children: [_jsx("p", { className: "text-sm font-semibold text-slate-700", children: label }), _jsx("input", { type: "number", min: "0", max: key === 'engagementScore' ? 10 : 100, value: performanceInputs[key], onChange: (e) => handlePerformanceInputChange(key, Number(e.target.value)), className: "w-full mt-2 px-3 py-2 rounded-xl border border-slate-200 text-sm" })] }, key))) }), _jsxs("div", { className: "rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-wide", children: "Confidence Estimate" }), _jsxs("p", { className: "text-3xl font-bold", children: [Math.round((performanceInputs.studyHours / 24) * 0.25 * 100 +
                                            (performanceInputs.attendance / 100) * 0.25 * 100 +
                                            (performanceInputs.assignmentsScore / 100) * 0.2 * 100 +
                                            (performanceInputs.pastMarks / 100) * 0.2 * 100 +
                                            (performanceInputs.engagementScore / 10) * 0.1 * 100), "%"] }), _jsx("p", { className: "text-sm opacity-80", children: "This score approximates how these qualities drive your prediction." })] })] }), _jsxs("section", { className: "bg-white rounded-3xl shadow-2xl p-8 border border-slate-200 space-y-6", children: [_jsxs("header", { children: [_jsx("p", { className: "text-sm text-indigo-500 font-semibold", children: "Semester Marks" }), _jsx("h2", { className: "text-2xl font-bold text-slate-900", children: "Record your subject scores" }), _jsx("p", { className: "text-sm text-slate-500", children: "Slide or type to update the marks that feed into predictions." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: subjectList.map((subject) => {
                                const mark = subjectMarks[subject] ?? 0;
                                const riskLabel = mark < 40 ? 'Backlog' : mark < 60 ? 'Medium' : 'Low';
                                const riskColor = mark < 40 ? 'text-red-600' : mark < 60 ? 'text-yellow-600' : 'text-emerald-600';
                                return (_jsxs("div", { className: "border border-slate-100 rounded-2xl p-5 bg-slate-50 space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("p", { className: "font-semibold text-slate-800", children: subject }), _jsx("span", { className: `text-sm font-semibold ${riskColor}`, children: riskLabel })] }), _jsx("input", { type: "range", min: "0", max: "100", value: mark, onChange: (e) => handleMarkChange(subject, Number(e.target.value)), className: "w-full appearance-none h-2 rounded-full bg-slate-300 accent-indigo-500" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("input", { type: "number", min: "0", max: "100", value: mark, onChange: (e) => handleMarkChange(subject, Number(e.target.value)), className: "w-20 px-3 py-2 border rounded-xl border-slate-200 text-center" }), _jsx("p", { className: "text-xs text-slate-500", children: "/ 100" })] })] }, subject));
                            }) })] })] }) }));
};

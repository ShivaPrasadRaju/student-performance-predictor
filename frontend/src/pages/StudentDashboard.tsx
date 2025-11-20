import React, { useEffect, useMemo, useRef, useState } from 'react';
import { weeklyTaskService } from '../services/api';
import { DashboardShell } from '../components/DashboardShell';

const SEMESTER_SUBJECTS: Record<number, string[]> = {
  1: [
    'Engineering Mathematics I',
    'Engineering Physics',
    'Engineering Chemistry',
    'Basic Electrical & Electronics Engineering',
    'Programming in C',
  ],
  2: [
    'Engineering Mathematics II',
    'Workshop / Manufacturing Practices',
    'Engineering Graphics',
    'Environmental Science & Engineering',
    'Professional Communication & Ethics',
  ],
  3: [
    'Data Structures',
    'Discrete Mathematics',
    'Object Oriented Programming',
    'Computer Organization',
    'Design and Analysis of Algorithms',
    'Operating Systems',
  ],
  4: [
    'Database Management Systems',
    'Computer Networks',
    'Software Engineering',
    'Theory of Computation',
    'Compiler Design',
    'Artificial Intelligence / Machine Learning (elective)',
    'Mobile Application Development',
  ],
};

const ALL_SUBJECTS = Array.from(new Set(Object.values(SEMESTER_SUBJECTS).flat()));
const SEMESTER_OPTIONS = Object.keys(SEMESTER_SUBJECTS)
  .map(Number)
  .sort((a, b) => a - b);

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const buildInitialTasks = () =>
  WEEK_DAYS.map((day) => ({
    day,
    task: '',
    completed: false,
  }));

const buildInitialMarks = (subjects: string[] = ALL_SUBJECTS) =>
  subjects.reduce<Record<string, number>>((acc, subject) => {
    acc[subject] = 75;
    return acc;
  }, {});

const getWeekStart = (reference: Date = new Date()) => {
  const dayIndex = reference.getDay();
  const offset = (dayIndex + 6) % 7;
  const weekStart = new Date(reference);
  weekStart.setDate(reference.getDate() - offset);
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const StudentDashboard: React.FC = () => {
  const [selectedSemester, setSelectedSemester] = useState(SEMESTER_OPTIONS[0]);
  const [subjectMarks, setSubjectMarks] = useState<Record<string, number>>(buildInitialMarks());
  const [weeklyTasks, setWeeklyTasks] = useState(buildInitialTasks());
  const [weekStart, setWeekStart] = useState(() => formatDate(getWeekStart()));
  const [performanceInputs, setPerformanceInputs] = useState({
    studyHours: 6,
    attendance: 85,
    assignmentsScore: 80,
    pastMarks: 75,
    engagementScore: 7,
  });
  const [readingMode, setReadingMode] = useState(false);
  const [readingStart, setReadingStart] = useState<number | null>(null);
  const [readingMinutes, setReadingMinutes] = useState(0);
  const [liveReadingMinutes, setLiveReadingMinutes] = useState(0);

  const completedTasks = useMemo(() => {
    return weeklyTasks.reduce<Record<string, boolean>>((acc, task) => {
      acc[task.day] = task.completed;
      return acc;
    }, {});
  }, [weeklyTasks]);

  const subjectList = useMemo(() => {
    return SEMESTER_SUBJECTS[selectedSemester] ?? SEMESTER_SUBJECTS[SEMESTER_OPTIONS[0]];
  }, [selectedSemester]);

  useEffect(() => {
    setSubjectMarks((prev) => {
      const nextMarks = { ...prev };
      subjectList.forEach((subject) => {
        if (!(subject in nextMarks)) {
          nextMarks[subject] = 75;
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
      } catch (err) {
        console.error('Unable to load weekly tasks', err);
      }
    };

    loadTasks();
  }, [weekStart]);

  useEffect(() => {
    const stored = localStorage.getItem('student-reading-minutes');
    if (stored) {
      const parsed = Number(stored);
      if (!Number.isNaN(parsed)) {
        setReadingMinutes(parsed);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('student-reading-minutes', readingMinutes.toString());
  }, [readingMinutes]);

  useEffect(() => {
    if (!readingMode || !readingStart) return;
    const interval = window.setInterval(() => {
      setLiveReadingMinutes((Date.now() - readingStart) / 60000);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [readingMode, readingStart]);

  const longestStreak = useMemo(() => {
    let streak = 0;
    let longest = 0;
    WEEK_DAYS.forEach((day) => {
      if (completedTasks[day]) {
        streak += 1;
        longest = Math.max(longest, streak);
      } else {
        streak = 0;
      }
    });
    return longest;
  }, [completedTasks]);

  const completionPercent = useMemo(() => {
    const done = WEEK_DAYS.filter((day) => completedTasks[day]).length;
    return Math.round((done / WEEK_DAYS.length) * 100);
  }, [completedTasks]);

  const prevCompletionRef = useRef(completionPercent);
  const [taskBoost, setTaskBoost] = useState(0);
  useEffect(() => {
    const delta = completionPercent - prevCompletionRef.current;
    setTaskBoost(delta);
    prevCompletionRef.current = completionPercent;
  }, [completionPercent]);

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

  const confidenceEstimate = useMemo(() => {
    return Math.round(
      (performanceInputs.studyHours / 24) * 0.25 * 100 +
        (performanceInputs.attendance / 100) * 0.25 * 100 +
        (performanceInputs.assignmentsScore / 100) * 0.2 * 100 +
        (performanceInputs.pastMarks / 100) * 0.2 * 100 +
        (performanceInputs.engagementScore / 10) * 0.1 * 100
    );
  }, [performanceInputs]);

  const riskCategory = useMemo(() => {
    if (performanceScore >= 70) return 'Low';
    if (performanceScore >= 45) return 'Medium';
    return 'High';
  }, [performanceScore]);

  const riskBadgeStyles: Record<string, string> = {
    Low: 'border border-emerald-500/30 bg-emerald-500/20 text-emerald-200',
    Medium: 'border border-amber-500/30 bg-amber-500/20 text-amber-200',
    High: 'border border-rose-500/30 bg-rose-500/20 text-rose-200',
  };

  const passFailStatus = performanceScore >= 50 ? 'Expected to Pass' : 'At Risk of Failing';

  const chartPoints = useMemo(() => {
    const trend = [performanceScore - 8, performanceScore - 3, performanceScore, performanceScore + 2].map((value) =>
      Math.max(0, Math.min(100, value))
    );
    return trend
      .map((score, index) => `${(index / (trend.length - 1)) * 100},${100 - score}`)
      .join(' ');
  }, [performanceScore]);

  const featureSummary = [
    { label: 'Study Hours', value: `${performanceInputs.studyHours} hrs/day` },
    { label: 'Attendance', value: `${performanceInputs.attendance}%` },
    { label: 'Assignments', value: `${performanceInputs.assignmentsScore}%` },
    { label: 'Past Marks', value: `${performanceInputs.pastMarks}%` },
    { label: 'Engagement', value: `${performanceInputs.engagementScore}/10` },
    { label: 'Task Completion', value: `${completionPercent}% weekly` },
  ];

  const actionTips: Record<string, string> = {
    High:
      'High risk: elevate attendance, complete assignments, and extend study sessions by 2 hrs/day to reduce volatility.',
    Medium:
      'Medium risk: keep streaks intact, clear backlog subjects, and collaborate with mentors before the next prediction run.',
    Low:
      'Low risk: you are on track—keep logging tasks, maintain attendance, and support peers with insights.',
  };

  const actionTip = actionTips[riskCategory];

  const handleMarkChange = (subject: string, value: number) => {
    setSubjectMarks((prev) => ({
      ...prev,
      [subject]: Math.max(0, Math.min(100, value)),
    }));
  };

  const handleTaskUpdate = (day: string, value: string) => {
    setWeeklyTasks((prev) => prev.map((task) => (task.day === day ? { ...task, task: value } : task)));
  };

  const toggleTaskCompletion = (day: string) => {
    setWeeklyTasks((prev) =>
      prev.map((task) => (task.day === day ? { ...task, completed: !task.completed } : task))
    );
  };

  const handleSaveTasks = async () => {
    try {
      await weeklyTaskService.sync({
        week_start: weekStart,
        entries: weeklyTasks.map(({ day, task, completed }) => ({ day, task, completed })),
      });
      alert('Weekly tasks saved');
    } catch (err) {
      console.error('Failed to save tasks', err);
      alert('Unable to save tasks. Please try again.');
    }
  };

  const handlePerformanceInputChange = (key: keyof typeof performanceInputs, value: number) => {
    setPerformanceInputs((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.min(key === 'engagementScore' ? 10 : key === 'studyHours' ? 24 : 100, value)),
    }));
  };

  const toggleReadingMode = () => {
    if (readingMode) {
      if (readingStart) {
        const elapsed = (Date.now() - readingStart) / 60000;
        setReadingMinutes((prev) => prev + elapsed);
      }
      setReadingMode(false);
      setReadingStart(null);
      setLiveReadingMinutes(0);
    } else {
      setReadingMode(true);
      setReadingStart(Date.now());
      setLiveReadingMinutes(0);
    }
  };

  const formattedReadingTime = useMemo(() => {
    const total = readingMinutes + (readingMode ? liveReadingMinutes : 0);
    const hrs = Math.floor(total / 60);
    const mins = Math.floor(total % 60);
    return `${hrs}h ${mins}m`;
  }, [readingMinutes, liveReadingMinutes, readingMode]);

  const handleExportStudentData = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      weekStart,
      readingMinutes: Number((readingMinutes + (readingMode ? liveReadingMinutes : 0)).toFixed(2)),
      performanceInputs,
      subjectMarks,
      weeklyTasks,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'student-dashboard-data.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const taskTrendPoints = useMemo(() => {
    if (weeklyTasks.length <= 1) return '0,50 100,50';
    const values = weeklyTasks.map((task) => {
      if (task.completed) return 95;
      return task.task.trim() ? 55 : 20;
    });
    return values
      .map((value, index) => `${(index / (values.length - 1)) * 100},${100 - value}`)
      .join(' ');
  }, [weeklyTasks]);

  const semesterAverages = useMemo(
    () =>
      SEMESTER_OPTIONS.map((semester) => {
        const subjects = SEMESTER_SUBJECTS[semester];
        const total = subjects.reduce((sum, subject) => sum + (subjectMarks[subject] ?? 0), 0);
        const average = subjects.length ? Math.round(total / subjects.length) : 0;
        return { semester, average };
      }),
    [subjectMarks]
  );

  const overallPerformancePoints = useMemo(() => {
    if (semesterAverages.length <= 1) return '0,50 100,50';
    return semesterAverages
      .map((entry, index) => {
        const x = (index / (semesterAverages.length - 1)) * 100;
        const y = 100 - entry.average;
        return `${x},${y}`;
      })
      .join(' ');
  }, [semesterAverages]);

  return (
    <DashboardShell role="student">
      <div className="min-h-screen py-10 px-4">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#08011d] via-[#160534] to-[#070a1f] p-8 text-white shadow-2xl">
              <div className="flex flex-col gap-3">
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">VTU Scheme · AI Insights</p>
                <div className="flex flex-wrap gap-2 sm:flex-row sm:items-center">
                  <div>
                    <h1 className="text-4xl font-black">📊 My Dashboard</h1>
                    <p className="text-sm text-white/70">Track streaks, marks, and habits powering your prediction.</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.3em] text-white/70">
                    Updated · {new Date().toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={handleExportStudentData}
                  className="mt-3 w-full rounded-2xl border border-white/20 px-4 py-3 text-xs font-semibold text-white transition hover:border-white/40 sm:w-auto"
                >
                  ⬇️ Download Dashboard JSON
                </button>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/12 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">Avg Marks</p>
                  <p className="text-3xl font-bold text-[#21ffd5]">{averageMark}%</p>
                  <p className="text-xs text-white/60">Across subjects</p>
                </div>
                <div className="rounded-2xl border border-white/12 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">Performance</p>
                  <p className="text-3xl font-bold text-[#8a63ff]">{performanceScore}</p>
                  <p className="text-xs text-white/60">AI score</p>
                </div>
                <div className="rounded-2xl border border-white/12 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">Task Boost</p>
                  <p className={`text-3xl font-bold ${taskBoost >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {taskBoost >= 0 ? '+' : ''}
                    {taskBoost.toFixed(1)}
                  </p>
                  <p className="text-xs text-white/60">Score delta</p>
                </div>
                <div className={`rounded-2xl border border-white/12 bg-white/5 p-4 ${readingMode ? 'reading-pulse' : ''}`}>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">Reading Mode</p>
                  <p className="text-3xl font-bold text-[var(--color-secondary)]">{formattedReadingTime}</p>
                  <p className="text-xs text-white/60">Total focus time</p>
                  <button
                    onClick={toggleReadingMode}
                    className={`mt-3 w-full rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      readingMode
                        ? 'border-rose-300 text-rose-200 hover:border-rose-200'
                        : 'border-[var(--color-secondary)] text-[var(--color-secondary)] hover:border-white'
                    }`}
                  >
                    {readingMode ? 'Stop Reading Mode' : 'Start Reading Mode'}
                  </button>
                </div>
              </div>
            </div>
            <div className="floating-card rounded-3xl p-6 text-slate-100">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">To-do header</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Influences prediction</h2>
              <p className="mt-2 text-sm text-slate-300">{dailyReminder}</p>
              <div className="mt-4 space-y-2">
                {weeklyTasks.slice(0, 4).map(({ day, completed }) => (
                  <div key={day} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{day}</span>
                    <span className={`rounded-full px-3 py-0.5 font-semibold ${
                      completed ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30' : 'border border-white/20 text-slate-300'
                    }`}>
                      {completed ? 'Done' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-slate-500">
                <span>Completion</span>
                <span>{completionPercent}%</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-200">
                <span className="font-semibold text-white">Task boost</span>
                <span className={taskBoost >= 0 ? 'text-emerald-200' : 'text-rose-200'}>
                  {taskBoost >= 0 ? '+' : ''}
                  {taskBoost.toFixed(1)} pts
                </span>
                <span className="text-slate-400">vs previous week</span>
              </div>
            </div>
          </div>

          <section className="floating-card rounded-3xl p-8 text-white">
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Prediction Snapshot</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-400">Predicted Score</p>
                  <div className="flex items-center gap-3">
                    <span className="text-5xl font-black text-white">{performanceScore}</span>
                    <span className={`rounded-full px-4 py-1 text-xs font-semibold ${riskBadgeStyles[riskCategory]}`}>
                      {riskCategory} Risk
                    </span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-300">{passFailStatus}</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr,200px]">
              <div className="space-y-1">
                <div className="h-32 w-full rounded-2xl border border-white/10 bg-white/5 p-4">
                  <svg className="h-full w-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0.9" />
                    </linearGradient>
                    <polyline fill="none" stroke="url(#trendGradient)" strokeWidth="3" points={chartPoints} />
                  </svg>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Score Trend</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Confidence</p>
                <p className="text-3xl font-bold text-[#a855f7]">{confidenceEstimate}%</p>
                <p className="text-xs font-medium text-slate-400">Model alignment</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {featureSummary.map((feature) => (
                <div key={feature.label} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm">
                  <p className="text-xs uppercase tracking-widest text-slate-500">{feature.label}</p>
                  <p className="text-base font-semibold text-white">{feature.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-[#a855f7]/30 bg-[#a855f7]/10 p-4 text-sm text-slate-100">
              <p className="font-semibold">Actionable Tip</p>
              <p className="text-sm text-slate-300">{actionTip}</p>
            </div>
          </section>

          <section className="floating-card rounded-3xl p-8 text-white">
            <header className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Overall Performance</p>
              <h2 className="text-2xl font-bold">Semester-wise trend</h2>
              <p className="text-sm text-slate-400">Visualize how your averages evolve every term.</p>
            </header>
            <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr,1fr]">
              <div className="h-48 rounded-2xl border border-white/10 bg-white/5 p-4">
                <svg className="h-full w-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="overallPerformance" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="var(--color-secondary)" />
                      <stop offset="100%" stopColor="var(--color-primary)" />
                    </linearGradient>
                  </defs>
                  <polyline fill="none" stroke="url(#overallPerformance)" strokeWidth="3" points={overallPerformancePoints} />
                </svg>
              </div>
              <div className="space-y-4">
                {semesterAverages.map(({ semester, average }) => (
                  <div key={semester}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Semester {semester}</span>
                      <span className="font-semibold text-white">{average}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#21ffd5] to-[#8a63ff]"
                        style={{ width: `${average}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="floating-card rounded-3xl p-8 text-slate-100">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">To Do List</p>
                <h2 className="text-2xl font-bold text-white">Weekly plan & reminders</h2>
                <p className="text-sm text-slate-400">Save your focus areas and keep streaks alive.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="date"
                  value={weekStart}
                  onChange={(e) => setWeekStart(e.target.value)}
                  className="rounded-2xl border border-white/15 bg-transparent px-4 py-2 text-sm text-white focus:border-[#a855f7] focus:outline-none"
                />
                <button
                  onClick={handleSaveTasks}
                  className="rounded-2xl bg-gradient-to-r from-[#8a63ff] to-[#21ffd5] px-4 py-2 text-sm font-semibold text-white shadow-lg transition"
                >
                  Save Weekly Tasks
                </button>
              </div>
            </header>
            <div className="grid gap-4 md:grid-cols-2">
              {weeklyTasks.map(({ day, task, completed }) => (
                <div key={day} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">{day}</p>
                    <button
                      onClick={() => toggleTaskCompletion(day)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        completed ? 'border-[var(--color-secondary)] text-[var(--color-secondary)]' : 'border-white/20 text-slate-300'
                      }`}
                    >
                      {completed ? 'Done' : 'Mark'}
                    </button>
                  </div>
                  <textarea
                    value={task}
                    placeholder="Describe focus for the day"
                    onChange={(e) => handleTaskUpdate(day, e.target.value)}
                    rows={3}
                    className="mt-3 w-full resize-none rounded-2xl border border-white/20 bg-white/90 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-[#a855f7] focus:outline-none"
                  />
                </div>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Weekly completion trend</p>
                <div className="mt-3 h-24 rounded-2xl border border-white/10 bg-white/5 p-3">
                  <svg className="h-full w-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="taskTrend" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="var(--color-secondary)" />
                        <stop offset="100%" stopColor="var(--color-primary)" />
                      </linearGradient>
                    </defs>
                    <polyline fill="none" stroke="url(#taskTrend)" strokeWidth="3" points={taskTrendPoints} />
                  </svg>
                </div>
                <p className="mt-2 text-xs text-slate-400">Higher peaks indicate completed or filled tasks.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Daily reminder</p>
                <p className="mt-2 text-lg font-semibold text-white">{dailyReminder}</p>
                <p className="text-sm text-slate-400">Streak: {longestStreak} · Completed {completionPercent}%</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-400">Saved activities</p>
                {weeklyTasks.filter((t) => t.task.trim()).length === 0 ? (
                  <p className="mt-2 text-sm text-slate-400">No activities saved yet.</p>
                ) : (
                  <ul className="mt-2 space-y-1 text-sm text-slate-200">
                    {weeklyTasks
                      .filter((t) => t.task.trim())
                      .map((t) => (
                        <li key={t.day} className="flex items-center justify-between">
                          <span>{t.day}</span>
                          <span
                            className={`text-xs font-semibold ${t.completed ? 'text-emerald-300' : 'text-amber-300'}`}
                          >
                            {t.completed ? 'Done' : 'Pending'}
                          </span>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          <section className="floating-card rounded-3xl p-8 text-white">
            <header>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Prediction Criteria</p>
              <h2 className="text-2xl font-bold text-white">Qualities that influence predictions</h2>
              <p className="text-sm text-slate-400">Adjust these metrics to understand how your performance profile shifts.</p>
            </header>
            <div className="grid gap-6 md:grid-cols-2">
              {[
                { key: 'studyHours', label: 'Study Hours', max: 24 },
                { key: 'attendance', label: 'Attendance (%)', max: 100 },
              ].map(({ key, label, max }) => (
                <div key={key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <span className="text-xs text-slate-400">
                      {performanceInputs[key as keyof typeof performanceInputs]}
                      {key === 'studyHours' ? ' hrs/day' : '%'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={max}
                    value={performanceInputs[key as keyof typeof performanceInputs]}
                    onChange={(e) => handlePerformanceInputChange(key as keyof typeof performanceInputs, Number(e.target.value))}
                    className="mt-3 w-full accent-[#a855f7]"
                  />
                </div>
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { key: 'assignmentsScore', label: 'Assignments Score' },
                { key: 'pastMarks', label: 'Past Marks' },
                { key: 'engagementScore', label: 'Engagement (1-10)' },
              ].map(({ key, label }) => (
                <div key={key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <input
                    type="number"
                    min="0"
                    max={key === 'engagementScore' ? 10 : 100}
                    value={performanceInputs[key as keyof typeof performanceInputs]}
                    onChange={(e) => handlePerformanceInputChange(key as keyof typeof performanceInputs, Number(e.target.value))}
                    className="mt-2 w-full rounded-xl border border-white/15 bg-transparent px-3 py-2 text-sm text-white"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="floating-card rounded-3xl p-8 text-white">
            <header>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Semester Marks</p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Record your subject scores</h2>
                  <p className="text-sm text-slate-400">Slide or type to update the marks that feed into predictions.</p>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  Semester
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(Number(e.target.value))}
                    className="rounded-2xl border border-white/20 bg-transparent px-3 py-2 text-white focus:border-[#a855f7] focus:outline-none"
                  >
                    {SEMESTER_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </header>
            <div className="grid gap-6 md:grid-cols-2">
              {subjectList.map((subject) => {
                const mark = subjectMarks[subject] ?? 0;
                let riskLabel = 'Backlog';
                let riskColor = 'text-rose-300';
                if (mark >= 80) {
                  riskLabel = 'High';
                  riskColor = 'text-emerald-300';
                } else if (mark >= 60) {
                  riskLabel = 'Medium';
                  riskColor = 'text-amber-300';
                } else if (mark >= 40) {
                  riskLabel = 'Low';
                  riskColor = 'text-rose-200';
                }
                return (
                  <div key={subject} className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white">{subject}</p>
                      <span className={`text-sm font-semibold ${riskColor}`}>{riskLabel}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={mark}
                      onChange={(e) => handleMarkChange(subject, Number(e.target.value))}
                      className="w-full accent-[#a855f7]"
                    />
                    <div className="flex items-center justify-between">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={mark}
                        onChange={(e) => handleMarkChange(subject, Number(e.target.value))}
                        className="w-20 rounded-xl border border-white/15 bg-transparent px-3 py-2 text-center text-sm text-white"
                      />
                      <p className="text-xs text-slate-400">/ 100</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
};

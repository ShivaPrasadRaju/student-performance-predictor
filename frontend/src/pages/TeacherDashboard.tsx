import React, { useEffect, useMemo, useState } from 'react';
import { DashboardShell } from '../components/DashboardShell';
import { studentService, predictionService } from '../services/api';
import { Student, StudentWithLatestPrediction, ClassAnalytics } from '../types';

type RiskFilter = 'all' | 'Low' | 'Medium' | 'High';
type DraftStudent = Omit<Student, 'id' | 'created_at' | 'updated_at'>;

const StatTile: React.FC<{ label: string; value: string | number; sub?: string; accent?: string }> = ({ label, value, sub, accent = 'var(--color-primary)' }) => (
  <div className="floating-card halo-glow rounded-3xl p-6">
    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{label}</p>
    <p className="text-4xl font-black" style={{ color: accent }}>{value}</p>
    {sub && <p className="text-sm text-slate-400">{sub}</p>}
  </div>
);

const riskPill: Record<Exclude<RiskFilter, 'all'>, string> = {
  Low: 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40',
  Medium: 'bg-amber-500/20 text-amber-200 border border-amber-500/40',
  High: 'bg-rose-500/20 text-rose-200 border border-rose-500/40',
};

export const TeacherDashboard: React.FC = () => {
  const draftTemplate: DraftStudent = {
    student_id: '',
    name: '',
    email: '',
    class_name: '',
    year: 2,
    section: 'A',
  };

  const [students, setStudents] = useState<StudentWithLatestPrediction[]>([]);
  const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRisk, setFilterRisk] = useState<RiskFilter>('all');
  const [year, setYear] = useState(2);
  const [sections, setSections] = useState<string[]>(['A']);
  const [selectedSection, setSelectedSection] = useState('A');
  const [newSectionName, setNewSectionName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newStudent, setNewStudent] = useState<DraftStudent>(draftTemplate);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<DraftStudent>(draftTemplate);
  const [activeStudent, setActiveStudent] = useState<StudentWithLatestPrediction | null>(null);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [studentRows, analyticsData] = await Promise.all([
        predictionService.getClassStudentsOverview(),
        predictionService.getClassAnalytics(),
      ]);
      if ((!studentRows || studentRows.length === 0) && !analyticsData) {
        const demoStudents: StudentWithLatestPrediction[] = [
          {
            id: 1,
            student_id: 'ST101',
            name: 'Asha Patel',
            email: 'asha@school.com',
            class_name: 'CS101',
            year: 2,
            section: 'A',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            latest_prediction: {
              id: 11,
              predicted_score: 48,
              pass_fail: 'Fail',
              risk_category: 'High',
              confidence: 0.72,
              study_hours: 2,
              attendance: 60,
              assignments_score: 40,
              past_marks: 52,
              engagement_score: 3,
              created_at: new Date().toISOString(),
            },
          },
          {
            id: 2,
            student_id: 'ST102',
            name: 'Ravi Kumar',
            email: 'ravi@school.com',
            class_name: 'CS101',
            year: 2,
            section: 'A',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            latest_prediction: {
              id: 12,
              predicted_score: 82,
              pass_fail: 'Pass',
              risk_category: 'Low',
              confidence: 0.91,
              study_hours: 8,
              attendance: 95,
              assignments_score: 90,
              past_marks: 86,
              engagement_score: 9,
              created_at: new Date().toISOString(),
            },
          },
          {
            id: 3,
            student_id: 'ST103',
            name: 'Meera Singh',
            email: 'meera@school.com',
            class_name: 'CS101',
            year: 2,
            section: 'A',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            latest_prediction: {
              id: 13,
              predicted_score: 70,
              pass_fail: 'Pass',
              risk_category: 'Medium',
              confidence: 0.8,
              study_hours: 5,
              attendance: 84,
              assignments_score: 72,
              past_marks: 68,
              engagement_score: 6,
              created_at: new Date().toISOString(),
            },
          },
        ];
        const demoAnalytics: ClassAnalytics = {
          total_students: 3,
          total_predictions: 3,
          average_score: 66,
          risk_distribution: { low_risk: 1, medium_risk: 1, high_risk: 1 },
          pass_rate: 66,
        };
        setStudents(demoStudents);
        setAnalytics(demoAnalytics);
      } else {
        setStudents(studentRows || []);
        setAnalytics(analyticsData || null);
      }
    } catch (err) {
      setError('Unable to load class data. Showing demo.');
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => {
    const label = newSectionName.trim().toUpperCase();
    if (!label) return;
    if (sections.includes(label)) {
      setError('Section already exists');
      return;
    }
    setSections([...sections, label]);
    setSelectedSection(label);
    setNewSectionName('');
  };

  const handleAddStudent = async () => {
    if (!newStudent.student_id || !newStudent.name || !newStudent.email) {
      setError('Fill Student ID, name, and email');
      return;
    }
    try {
      await studentService.create({ ...newStudent, year, section: newStudent.section || selectedSection });
      setNewStudent({ ...draftTemplate, year, section: selectedSection });
      setShowCreate(false);
      await loadData();
    } catch (err) {
      setError('Unable to add student');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this student from the class roster?')) return;
    try {
      await studentService.delete(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete student');
    }
  };

  const openEditModal = (student: StudentWithLatestPrediction) => {
    setActiveStudent(student);
    setModalData({
      student_id: student.student_id,
      name: student.name,
      email: student.email,
      class_name: student.class_name,
      year: student.year,
      section: student.section,
    });
    setModalOpen(true);
  };

  const handleModalSave = async () => {
    if (!activeStudent) return;
    try {
      await studentService.update(activeStudent.id, modalData);
      setModalOpen(false);
      setActiveStudent(null);
      await loadData();
    } catch (err) {
      setError('Unable to update student');
    }
  };

  const filteredStudents = useMemo(
    () =>
      students
        .filter((student) => student.year === year && student.section === selectedSection)
        .filter((student) => (filterRisk === 'all' ? true : student.latest_prediction?.risk_category === filterRisk)),
    [students, year, selectedSection, filterRisk]
  );

  return (
    <DashboardShell role="teacher">
      <div className="min-h-screen py-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
          <header className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#12031f] via-[#1b0531] to-[#03011c] p-8 text-white shadow-2xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">Teacher · Intelligence console</p>
                <h1 className="text-4xl font-black">Class Performance Orbit</h1>
                <p className="text-sm text-white/70">
                  Track risk cohorts, run predictions, and nudge students right from this neon cockpit.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-full bg-gradient-to-r from-[#6F42C1] to-[#a855f7] px-6 py-3 text-sm font-semibold text-white shadow-lg" onClick={() => void loadData()}>
                  ⚡ Run Class Predictions
                </button>
                <button
                  className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white/80 hover:text-white"
                  onClick={() => setShowCreate((prev) => !prev)}
                >
                  {showCreate ? 'Close form' : '+ Add Student'}
                </button>
              </div>
            </div>
          </header>

          {error && <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-rose-100">{error}</div>}

          {analytics && (
            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <StatTile label="Total Students" value={analytics.total_students} sub="Active in roster" accent="var(--color-secondary)" />
              <StatTile label="Avg Prediction" value={`${analytics.average_score.toFixed(1)}%`} sub="Momentum" accent="var(--color-primary)" />
              <StatTile label="High Risk" value={analytics.risk_distribution.high_risk} sub="Needs intervention" accent="#fb7185" />
              <StatTile label="Pass likelihood" value={`${Math.round(analytics.pass_rate)}%`} sub="Based on latest run" accent="var(--color-amber)" />
            </section>
          )}

          {analytics && (
            <section className="floating-card rounded-3xl p-8 text-slate-100">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Risk distribution</p>
                  <p className="text-2xl font-semibold text-white">Live snapshot of cohorts</p>
                </div>
                <div className="flex items-center gap-6 text-sm text-slate-400">
                  <div>
                    <span className="text-white">{analytics.total_predictions}</span> predictions
                  </div>
                  <div>
                    <span className="text-white">{students.length}</span> learners
                  </div>
                </div>
              </div>
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <p className="text-sm text-emerald-200">Low risk</p>
                  <p className="text-4xl font-bold text-emerald-300">{analytics.risk_distribution.low_risk}</p>
                  <p className="text-xs text-slate-400">Keep sharing boosters & streak props</p>
                </div>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                  <p className="text-sm text-amber-200">Medium risk</p>
                  <p className="text-4xl font-bold text-amber-200">{analytics.risk_distribution.medium_risk}</p>
                  <p className="text-xs text-slate-400">Invite for focussed lab sessions</p>
                </div>
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
                  <p className="text-sm text-rose-200">High risk</p>
                  <p className="text-4xl font-bold text-rose-200">{analytics.risk_distribution.high_risk}</p>
                  <p className="text-xs text-slate-400">Schedule immediate mentoring</p>
                </div>
              </div>
              <div className="mt-8 h-40 rounded-2xl border border-white/10 bg-white/5 p-4">
                <svg className="h-full w-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="teacherTrend" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="var(--color-primary)" />
                      <stop offset="100%" stopColor="var(--color-secondary)" />
                    </linearGradient>
                  </defs>
                  <polyline
                    fill="none"
                    stroke="url(#teacherTrend)"
                    strokeWidth="3"
                    points={`0,${100 - analytics.pass_rate} 33,${100 - analytics.risk_distribution.medium_risk * 5} 66,${
                      100 - analytics.average_score
                    } 100,${100 - analytics.risk_distribution.low_risk * 5}`}
                  />
                </svg>
              </div>
            </section>
          )}

          {showCreate && (
            <section className="floating-card rounded-3xl p-6 text-slate-100">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-semibold text-white">Add a new student</h2>
                <p className="text-sm text-slate-400">Populate roster details to start predictions instantly.</p>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <input
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                  placeholder="Student ID"
                  value={newStudent.student_id}
                  onChange={(e) => setNewStudent({ ...newStudent, student_id: e.target.value })}
                />
                <input
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                  placeholder="Full name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                />
                <input
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                  placeholder="Email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                />
                <input
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                  placeholder="Class name"
                  value={newStudent.class_name}
                  onChange={(e) => setNewStudent({ ...newStudent, class_name: e.target.value })}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                <select
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                  value={newStudent.section}
                  onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })}
                >
                  {sections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
                <button className="rounded-2xl bg-gradient-to-r from-[#6F42C1] to-[#a855f7] px-6 py-3 text-sm font-semibold text-white" onClick={() => void handleAddStudent()}>
                  Save student
                </button>
              </div>
            </section>
          )}

          <section className="floating-card rounded-3xl p-6 text-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-3">
                {(['all', 'Low', 'Medium', 'High'] as RiskFilter[]).map((chip) => (
                  <button
                    key={chip}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      filterRisk === chip ? 'bg-gradient-to-r from-[#6F42C1] to-[#a855f7]' : 'border border-white/15 text-slate-300'
                    }`}
                    onClick={() => setFilterRisk(chip)}
                  >
                    {chip === 'all' ? 'All students' : `${chip} risk`}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-slate-300">
                <label className="rounded-full border border-white/15 px-3 py-1">
                  Year
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="ml-2 bg-transparent text-white focus:outline-none"
                  >
                    {[1, 2, 3, 4].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="rounded-full border border-white/15 px-3 py-1">
                  Section
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="ml-2 bg-transparent text-white focus:outline-none"
                  >
                    {sections.map((section) => (
                      <option key={section} value={section}>
                        {section}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex items-center gap-2 rounded-full border border-white/15 px-3 py-1">
                  <input
                    className="bg-transparent text-white placeholder:text-slate-500 focus:outline-none"
                    placeholder="Add section"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                  />
                  <button className="text-[#a855f7]" onClick={addSection}>
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  <tr>
                    {['ID', 'Student', 'Email', 'Class', 'Score', 'Risk', 'Status', 'Actions'].map((col) => (
                      <th key={col} className="px-4 py-2">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-t border-white/10 hover:bg-white/5">
                      <td className="px-4 py-3 text-slate-300">{student.student_id}</td>
                      <td className="px-4 py-3 font-semibold text-white">{student.name}</td>
                      <td className="px-4 py-3 text-slate-400">{student.email}</td>
                      <td className="px-4 py-3 text-slate-400">{student.class_name}</td>
                      <td className="px-4 py-3 text-[#a855f7] font-semibold">
                        {student.latest_prediction?.predicted_score ?? '--'}
                      </td>
                      <td className="px-4 py-3">
                        {student.latest_prediction ? (
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            riskPill[student.latest_prediction.risk_category as Exclude<RiskFilter, 'all'>]
                          }`}>
                            {student.latest_prediction.risk_category}
                          </span>
                        ) : (
                          <span className="text-slate-500">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {student.latest_prediction && (
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            student.latest_prediction.pass_fail === 'Pass'
                              ? 'bg-emerald-500/20 text-emerald-200'
                              : 'bg-rose-500/20 text-rose-200'
                          }`}>
                            {student.latest_prediction.pass_fail}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-3">
                          <button className="text-slate-300 hover:text-white" onClick={() => openEditModal(student)}>
                            Edit
                          </button>
                          <button className="text-rose-300 hover:text-rose-200" onClick={() => void handleDelete(student.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!filteredStudents.length && (
              <div className="py-10 text-center text-slate-500">No students match the selected filters.</div>
            )}
          </section>

          {loading && <div className="text-center text-slate-400">Loading latest predictions…</div>}
        </div>
      </div>

      {modalOpen && activeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="floating-card w-full max-w-lg rounded-3xl p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Edit student</p>
                <h3 className="text-2xl font-semibold">{activeStudent.name}</h3>
              </div>
              <button className="text-slate-400 hover:text-white" onClick={() => setModalOpen(false)}>
                ✕
              </button>
            </div>
            <div className="mt-6 space-y-4">
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                value={modalData.student_id}
                onChange={(e) => setModalData({ ...modalData, student_id: e.target.value })}
                placeholder="Student ID"
              />
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                value={modalData.name}
                onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                placeholder="Full name"
              />
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                value={modalData.email}
                onChange={(e) => setModalData({ ...modalData, email: e.target.value })}
                placeholder="Email"
              />
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
                value={modalData.class_name}
                onChange={(e) => setModalData({ ...modalData, class_name: e.target.value })}
                placeholder="Class"
              />
              <div className="flex gap-4">
                <select
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                  value={modalData.year}
                  onChange={(e) => setModalData({ ...modalData, year: Number(e.target.value) })}
                >
                  {[1, 2, 3, 4].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <select
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                  value={modalData.section}
                  onChange={(e) => setModalData({ ...modalData, section: e.target.value })}
                >
                  {sections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button className="rounded-full border border-white/20 px-5 py-2 text-sm" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button className="rounded-full bg-gradient-to-r from-[#6F42C1] to-[#a855f7] px-6 py-2 text-sm font-semibold" onClick={() => void handleModalSave()}>
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

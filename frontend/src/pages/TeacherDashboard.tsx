import React, { useEffect, useState } from 'react';
import { studentService, predictionService } from '../services/api';
import { Student, StudentWithLatestPrediction, ClassAnalytics } from '../types';

// Small presentational helpers (kept in-file to avoid adding files)
const StatCard: React.FC<{ title: string; value: string | number; subtitle?: string; gradient?: string; icon?: React.ReactNode }> = ({ title, value, subtitle, gradient, icon }) => (
  <div className={`rounded-2xl p-5 shadow-lg transform transition hover:-translate-y-1 ${gradient || 'bg-white'}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-100/90 font-semibold">{title}</p>
        <p className="mt-2 text-2xl font-bold text-white">{value}</p>
        {subtitle && <p className="text-xs text-white/80 mt-1">{subtitle}</p>}
      </div>
      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/20">
        {icon}
      </div>
    </div>
  </div>
);

const ProgressBar: React.FC<{ value: number; label?: string }> = ({ value, label }) => (
  <div className="w-full">
    <div className="flex items-center justify-between mb-1">
      {label && <span className="text-xs text-gray-600">{label}</span>}
      <span className="text-xs text-gray-600">{Math.round(value)}%</span>
    </div>
    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
      <div className="h-3 bg-gradient-to-r from-green-400 to-blue-500 transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  </div>
);

const Badge: React.FC<{ children: React.ReactNode; tone?: 'green' | 'yellow' | 'red' }> = ({ children, tone = 'green' }) => {
  const colors = {
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[tone]}`}>{children}</span>;
};

export const TeacherDashboard: React.FC = () => {
  const [students, setStudents] = useState<StudentWithLatestPrediction[]>([]);
  const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [year, setYear] = useState<number>(1);
  const [sections, setSections] = useState<string[]>(['A']);
  const [newSectionName, setNewSectionName] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('A');

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
        const demoStudents: StudentWithLatestPrediction[] = [
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

        const demoAnalytics: ClassAnalytics = {
          total_students: 3,
          total_predictions: 3,
          average_score: 65.33,
          risk_distribution: { low_risk: 1, medium_risk: 1, high_risk: 1 },
          pass_rate: 66.67,
        };

        setStudents(demoStudents);
        setAnalytics(demoAnalytics);
      } else {
        setStudents(studentsData || []);
        setAnalytics(analyticsData || null);
      }
    } catch (err) {
      // fallback to demo if backend error
      const demoStudents: StudentWithLatestPrediction[] = [
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

      const demoAnalytics: ClassAnalytics = {
        total_students: 3,
        total_predictions: 3,
        average_score: 65.33,
        risk_distribution: { low_risk: 1, medium_risk: 1, high_risk: 1 },
        pass_rate: 66.67,
      };

      setStudents(demoStudents);
      setAnalytics(demoAnalytics);
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => {
    const s = newSectionName.trim().toUpperCase();
    if (!s) return;
    if (sections.includes(s)) {
      setError('Section already exists');
      return;
    }
    setSections([...sections, s]);
    setSelectedSection(s);
    setNewSectionName('');
  };

  const removeSection = (s: string) => {
    if (sections.length === 1) {
      setError('Cannot remove the last section');
      return;
    }
    if (!confirm(`Remove section ${s}? This will not delete students automatically.`)) return;
    const remaining = sections.filter(sec => sec !== s);
    setSections(remaining);
    if (selectedSection === s) setSelectedSection(remaining[0]);
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
    } catch (err) {
      setError('Failed to add student');
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (confirm('Are you sure you want to delete this student?')) {
      try {
        await studentService.delete(studentId);
        await loadData();
      } catch (err) {
        setError('Failed to delete student');
      }
    }
  };

  const filteredStudents = students
    .filter(s => s.year === year && s.section === selectedSection)
    .filter(s => filterRisk === 'all' ? true : s.latest_prediction?.risk_category === filterRisk);

  const getRiskColor = (risk: string) => {
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">👨‍🏫 Class Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage students and track class performance</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Analytics Cards (gamified) */}
        {analytics && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Students"
              value={analytics.total_students}
              subtitle="Active in selected class"
              gradient="bg-gradient-to-r from-indigo-500 to-purple-600"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 10-8 0v4" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v7" /></svg>}
            />
            <StatCard
              title="Average Score"
              value={analytics.average_score.toFixed(1)}
              subtitle="Class progress (0-100)"
              gradient="bg-gradient-to-r from-green-400 to-blue-500"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17a4 4 0 100-8 4 4 0 000 8z" /></svg>}
            />
            <div className="md:col-span-2 bg-white rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-500">Class Momentum</p>
                  <p className="text-lg font-bold text-gray-900">{analytics.average_score.toFixed(1)} / 100</p>
                </div>
                <div className="text-right">
                  <Badge tone="green">Pass {Math.round(analytics.pass_rate)}%</Badge>
                </div>
              </div>
              <div className="mb-4">
                <ProgressBar value={analytics.average_score} label="Average Score" />
              </div>
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Predictions</p>
                  <p className="text-sm font-semibold text-gray-800">{analytics.total_predictions}</p>
                </div>
                <div className="w-28 h-16 flex items-center justify-center bg-gradient-to-r from-yellow-200 to-pink-200 rounded-lg">
                  <svg viewBox="0 0 64 64" className="w-12 h-12" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#fff" opacity="0.2"/><path d="M32 12 L39 28 L56 28 L42 36 L48 52 L32 42 L16 52 L22 36 L8 28 L25 28 Z" fill="#fff" opacity="0.9"/></svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Risk Distribution (visual) */}
        {analytics && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Risk Distribution</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-green-100 border border-green-200 flex items-center gap-4">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7l3-7z" /></svg>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Low Risk</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-2xl font-bold text-green-700">{analytics.risk_distribution.low_risk}</p>
                    <Badge tone="green">Good</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Students likely to pass — keep the momentum up</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 flex items-center gap-4">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <svg className="w-8 h-8 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="10"/></svg>
                </div>
                <div>
                  <p className="text-sm text-gray-700">Medium Risk</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-2xl font-bold text-yellow-700">{analytics.risk_distribution.medium_risk}</p>
                    <Badge tone="yellow">Monitor</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Targeted interventions can improve outcomes</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-gradient-to-r from-red-50 to-red-100 border border-red-200 flex items-center gap-4">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <svg className="w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                </div>
                <div>
                  <p className="text-sm text-gray-700">High Risk</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-2xl font-bold text-red-700">{analytics.risk_distribution.high_risk}</p>
                    <Badge tone="red">Action</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Consider mentoring and extra practice sessions</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Students Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Students</h2>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Year</label>
                <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="px-3 py-2 border rounded">
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Section</label>
                <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} className="px-3 py-2 border rounded">
                  {sections.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => removeSection(selectedSection)} className="px-3 py-2 bg-red-100 text-red-700 rounded">Remove</button>
                <input placeholder="New Section (A)" value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} className="px-3 py-2 border rounded" />
                <button onClick={addSection} className="px-3 py-2 bg-gray-100 rounded">Add Section</button>
              </div>
              <button
              onClick={() => setShowAddStudent(!showAddStudent)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
            >
              {showAddStudent ? 'Cancel' : '+ Add Student'}
            </button>
            </div>
          </div>

          {showAddStudent && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Student ID"
                  value={newStudent.student_id}
                  onChange={(e) => setNewStudent({ ...newStudent, student_id: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Class Name"
                  value={newStudent.class_name}
                  onChange={(e) => setNewStudent({ ...newStudent, class_name: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                />
                <div className="flex items-center gap-2">
                  <label className="text-sm">Section</label>
                  <select value={newStudent.section} onChange={(e) => setNewStudent({ ...newStudent, section: e.target.value })} className="px-3 py-2 border rounded">
                    {sections.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <button
                onClick={handleAddStudent}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
              >
                Add Student
              </button>
            </div>
          )}

          {/* Filter */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setFilterRisk('all')}
              className={`px-4 py-2 rounded-lg ${filterRisk === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterRisk('Low')}
              className={`px-4 py-2 rounded-lg ${filterRisk === 'Low' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Low Risk
            </button>
            <button
              onClick={() => setFilterRisk('Medium')}
              className={`px-4 py-2 rounded-lg ${filterRisk === 'Medium' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Medium Risk
            </button>
            <button
              onClick={() => setFilterRisk('High')}
              className={`px-4 py-2 rounded-lg ${filterRisk === 'High' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              High Risk
            </button>
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Class</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Year</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Section</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Latest Score</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Risk</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{student.student_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{student.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.class_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.year}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.section}</td>
                    <td className="px-4 py-3 text-sm">
                      {student.latest_prediction ? (
                        <span className="font-bold text-primary-600">{student.latest_prediction.predicted_score}</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {student.latest_prediction ? (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(student.latest_prediction.risk_category)}`}>
                          {student.latest_prediction.risk_category}
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {student.latest_prediction && (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${student.latest_prediction.pass_fail === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {student.latest_prediction.pass_fail}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No students found
            </div>
          )}
        </div>

        {loading && <div className="text-center text-gray-600">Loading...</div>}
      </div>
    </div>
  );
};

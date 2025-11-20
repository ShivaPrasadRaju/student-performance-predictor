import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface Subject {
  code: string;
  name: string;
  type: string;
  credits: number;
  weightage: number;
}

interface SemesterData {
  semester: number;
  name: string;
  subjects: Subject[];
}

interface SubjectMark {
  [key: string]: number; // subject_code -> marks
}

interface PredictionResult {
  semester: number;
  academic_status: string;
  sgpa: number;
  estimated_cgpa: number;
  backlog_risk: number;
  backlog_subjects: any[];
  test_consistency: number;
  improvement_trend: string;
  recommendation_plan: any;
  study_schedule: any;
}

export default function VTUDashboard() {
  const { user, token } = useAuth();
  const [selectedSemester, setSelectedSemester] = useState<number>(3);
  const [semesterData, setSemesterData] = useState<SemesterData | null>(null);
  const [subjectMarks, setSubjectMarks] = useState<SubjectMark>({});
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'marks' | 'prediction' | 'schedule'>('marks');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Load semester subjects when semester changes
  useEffect(() => {
    const loadSemesterSubjects = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_URL}/api/v1/vtu/semesters/${selectedSemester}/subjects`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSemesterData(response.data);
        // Initialize marks to 0
        const marks: SubjectMark = {};
        response.data.subjects.forEach((subject: Subject) => {
          marks[subject.code] = 0;
        });
        setSubjectMarks(marks);
      } catch (error) {
        console.error('Error loading semester subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSemesterSubjects();
  }, [selectedSemester, token]);

  // Handle mark change via slider/input
  const handleMarkChange = (subjectCode: string, value: number) => {
    setSubjectMarks({
      ...subjectMarks,
      [subjectCode]: Math.min(100, Math.max(0, value)),
    });
  };

  // Submit marks
  const handleSubmitMarks = async () => {
    if (!token || !semesterData) return;

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

      await axios.post(
        `${API_URL}/api/v1/vtu/marks/submit`,
        {
          semester: selectedSemester,
          subject_marks: marksData,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Marks submitted successfully!');
    } catch (error) {
      console.error('Error submitting marks:', error);
      alert('Failed to submit marks');
    } finally {
      setLoading(false);
    }
  };

  // Generate prediction
  const handleGeneratePrediction = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/api/v1/vtu/prediction/generate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPrediction(response.data);
      setActiveTab('prediction');
    } catch (error) {
      console.error('Error generating prediction:', error);
      alert('Failed to generate prediction. Make sure marks are submitted first.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    if (risk === 'Low') return 'bg-green-100 text-green-800';
    if (risk === 'Medium') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusColor = (status: string) => {
    if (status === 'Good') return 'bg-green-500';
    if (status === 'Moderate') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMarkColor = (mark: number) => {
    if (mark >= 75) return 'text-green-600';
    if (mark >= 60) return 'text-yellow-600';
    if (mark >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Please log in to access the VTU Dashboard</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">📚 VTU Performance Predictor</h1>
          <p className="text-gray-600">Semester {selectedSemester} - Input your subject marks to get AI-powered predictions</p>
        </div>

        {/* Semester Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-4">Select Semester</label>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedSemester === sem
                    ? 'bg-indigo-600 text-white shadow-lg scale-105'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Sem {sem}
              </button>
            ))}
          </div>
          {semesterData && (
            <p className="text-sm text-gray-600 mt-4">📖 {semesterData.name}</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('marks')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'marks'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            📝 Add Marks
          </button>
          <button
            onClick={() => setActiveTab('prediction')}
            disabled={!prediction}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'prediction'
                ? 'bg-indigo-600 text-white shadow-lg'
                : prediction
                ? 'bg-white text-gray-700 hover:bg-gray-100'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            🎯 Prediction
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            disabled={!prediction}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'schedule'
                ? 'bg-indigo-600 text-white shadow-lg'
                : prediction
                ? 'bg-white text-gray-700 hover:bg-gray-100'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            📅 Study Plan
          </button>
        </div>

        {/* Marks Tab */}
        {activeTab === 'marks' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Add Subject Marks</h2>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : semesterData ? (
              <div className="space-y-6">
                {/* Subject Marks Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {semesterData.subjects.map((subject) => {
                    const mark = subjectMarks[subject.code] || 0;
                    return (
                      <div
                        key={subject.code}
                        className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 border-2 border-gray-200 hover:border-indigo-300 transition-all"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-gray-800">{subject.name}</h3>
                            <div className="flex gap-2 mt-1">
                              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                                {subject.type}
                              </span>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {subject.credits} credits
                              </span>
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                {subject.code}
                              </span>
                            </div>
                          </div>
                          <div className={`text-3xl font-bold ${getMarkColor(mark)}`}>
                            {mark}
                          </div>
                        </div>

                        {/* Slider */}
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={mark}
                          onChange={(e) =>
                            handleMarkChange(subject.code, parseInt(e.target.value))
                          }
                          className="w-full h-3 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />

                        {/* Input Box */}
                        <div className="flex items-center gap-2 mt-3">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={mark}
                            onChange={(e) =>
                              handleMarkChange(subject.code, parseInt(e.target.value) || 0)
                            }
                            className="w-20 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 text-center font-semibold"
                          />
                          <span className="text-sm text-gray-600">/ 100</span>
                        </div>

                        {/* Risk Indicator */}
                        <div className="mt-3">
                          {mark >= 75 && (
                            <span className={`text-sm font-semibold px-3 py-1 rounded ${getRiskColor(
                              'Low'
                            )}`}>
                              ✅ Low Risk
                            </span>
                          )}
                          {mark >= 60 && mark < 75 && (
                            <span className={`text-sm font-semibold px-3 py-1 rounded ${getRiskColor(
                              'Medium'
                            )}`}>
                              ⚠️ Medium Risk
                            </span>
                          )}
                          {mark < 60 && mark >= 40 && (
                            <span className={`text-sm font-semibold px-3 py-1 rounded ${getRiskColor(
                              'High'
                            )}`}>
                              🔴 High Risk
                            </span>
                          )}
                          {mark < 40 && (
                            <span className={`text-sm font-semibold px-3 py-1 rounded bg-red-200 text-red-800`}>
                              ❌ Backlog Risk
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t-2 border-gray-200">
                  <button
                    onClick={handleSubmitMarks}
                    disabled={loading}
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 disabled:bg-gray-400 transition-all shadow-md"
                  >
                    💾 Save Marks
                  </button>
                  <button
                    onClick={handleGeneratePrediction}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 transition-all shadow-md"
                  >
                    🎯 Generate Prediction
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Loading semester data...</p>
            )}
          </div>
        )}

        {/* Prediction Tab */}
        {activeTab === 'prediction' && prediction && (
          <div className="space-y-6">
            {/* Academic Status Card */}
            <div className={`${getStatusColor(prediction.academic_status)} rounded-lg shadow-lg p-8 text-white`}>
              <h2 className="text-3xl font-bold mb-4">🎓 Academic Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <p className="text-sm opacity-90">Status</p>
                  <p className="text-2xl font-bold">{prediction.academic_status}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <p className="text-sm opacity-90">SGPA</p>
                  <p className="text-2xl font-bold">{prediction.sgpa.toFixed(2)}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <p className="text-sm opacity-90">Est. CGPA</p>
                  <p className="text-2xl font-bold">{prediction.estimated_cgpa.toFixed(2)}</p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <p className="text-sm opacity-90">Backlog Risk</p>
                  <p className="text-2xl font-bold">{prediction.backlog_risk}</p>
                </div>
              </div>
            </div>

            {/* Backlog Subjects */}
            {prediction.backlog_subjects.length > 0 && (
              <div className="bg-red-50 rounded-lg shadow-lg p-8 border-2 border-red-200">
                <h3 className="text-2xl font-bold text-red-800 mb-4">⚠️ Subjects at Backlog Risk</h3>
                <div className="space-y-3">
                  {prediction.backlog_subjects.map((subject, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-800">{subject.name}</p>
                        <p className="text-sm text-gray-600">{subject.code} ({subject.type})</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-600">{subject.marks}</p>
                        <p className="text-xs text-gray-600">marks</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">📊 Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                  <h4 className="font-bold text-gray-800 mb-3">Test Consistency</h4>
                  <div className="w-full bg-gray-300 rounded-full h-4">
                    <div
                      className="bg-blue-600 h-4 rounded-full transition-all"
                      style={{ width: `${prediction.test_consistency}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{prediction.test_consistency.toFixed(1)}%</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                  <h4 className="font-bold text-gray-800 mb-3">Improvement Trend</h4>
                  <p className="text-2xl font-bold text-green-600">{prediction.improvement_trend}</p>
                  <p className="text-sm text-gray-700 mt-2">
                    {prediction.improvement_trend === 'Improving'
                      ? '📈 Your performance is getting better!'
                      : prediction.improvement_trend === 'Declining'
                      ? '📉 Consider focusing on weak areas'
                      : '➡️ Keep maintaining consistency'}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {prediction.recommendation_plan && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">💡 Recommendations</h3>
                
                {/* Focus Areas */}
                {prediction.recommendation_plan.focus_areas && prediction.recommendation_plan.focus_areas.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-800 mb-3">🎯 Focus Areas</h4>
                    <ul className="space-y-2">
                      {prediction.recommendation_plan.focus_areas.map((area: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700">
                          <span className="text-xl">✓</span>
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Weak Subjects */}
                {prediction.recommendation_plan.weak_subjects && prediction.recommendation_plan.weak_subjects.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-800 mb-3">📚 Weak Subjects (Top 3)</h4>
                    <div className="space-y-3">
                      {prediction.recommendation_plan.weak_subjects.map((subject: any, idx: number) => (
                        <div key={idx} className="bg-yellow-50 rounded-lg p-4">
                          <p className="font-bold text-gray-800">{subject.name}</p>
                          <p className="text-sm text-gray-600">Current: {subject.marks} | Risk: {subject.risk}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Daily Tasks */}
                {prediction.recommendation_plan.daily_tasks && prediction.recommendation_plan.daily_tasks.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-800 mb-3">📋 Suggested Daily Tasks</h4>
                    <div className="space-y-3">
                      {prediction.recommendation_plan.daily_tasks.map((task: any, idx: number) => (
                        <div key={idx} className="bg-blue-50 rounded-lg p-4">
                          <p className="font-bold text-gray-800">{task.day}: {task.subject}</p>
                          <p className="text-sm text-gray-700">{task.task}</p>
                          <p className="text-xs text-gray-600 mt-1">⏱️ {task.duration_minutes} min | Difficulty: {task.difficulty}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Study Schedule Tab */}
        {activeTab === 'schedule' && prediction && prediction.study_schedule && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📅 AI-Generated Study Schedule</h2>

            {/* Improvement Trend */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                <h4 className="font-bold text-gray-800 mb-2">Improvement Trend</h4>
                <p className="text-2xl font-bold text-purple-600">{prediction.study_schedule.improvement_trend}</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6">
                <h4 className="font-bold text-gray-800 mb-2">Consistency Score</h4>
                <p className="text-2xl font-bold text-indigo-600">{prediction.study_schedule.consistency_score.toFixed(1)}%</p>
              </div>
            </div>

            {/* Weekly Schedule */}
            {prediction.study_schedule.weekly_schedule && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📆 Weekly Schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(prediction.study_schedule.weekly_schedule).map(([day, activity]) => (
                    <div key={day} className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                      <p className="font-bold text-gray-800 capitalize">{day}</p>
                      <p className="text-sm text-gray-700 mt-2">{String(activity)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Milestones */}
            {prediction.study_schedule.milestones && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">🏆 Milestones (4-Week Plan)</h3>
                <div className="space-y-3">
                  {prediction.study_schedule.milestones.map((milestone: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                      <span className="text-2xl font-bold text-green-600">{idx + 1}</span>
                      <p className="text-gray-800 pt-1">{milestone}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

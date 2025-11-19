import React, { useEffect, useState } from 'react';
import { studentService, predictionService } from '../services/api';
import { Student, StudentWithLatestPrediction, ClassAnalytics } from '../types';

export const TeacherDashboard: React.FC = () => {
  const [students, setStudents] = useState<StudentWithLatestPrediction[]>([]);
  const [analytics, setAnalytics] = useState<ClassAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [filterRisk, setFilterRisk] = useState<string>('all');

  const [newStudent, setNewStudent] = useState({
    student_id: '',
    name: '',
    email: '',
    class_name: '',
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
      setStudents(studentsData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async () => {
    try {
      setError('');
      if (!newStudent.student_id || !newStudent.name || !newStudent.email) {
        setError('Please fill all fields');
        return;
      }
      await studentService.create(newStudent);
      setNewStudent({ student_id: '', name: '', email: '', class_name: '' });
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

  const filteredStudents = filterRisk === 'all' 
    ? students 
    : students.filter(s => s.latest_prediction?.risk_category === filterRisk);

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

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Total Students</p>
              <p className="text-3xl font-bold text-primary-600">{analytics.total_students}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Average Score</p>
              <p className="text-3xl font-bold text-blue-600">{analytics.average_score.toFixed(1)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Pass Rate</p>
              <p className="text-3xl font-bold text-green-600">{analytics.pass_rate.toFixed(1)}%</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-1">Predictions Made</p>
              <p className="text-3xl font-bold text-purple-600">{analytics.total_predictions}</p>
            </div>
          </div>
        )}

        {/* Risk Distribution */}
        {analytics && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Risk Distribution</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded p-4 border border-green-200">
                <p className="text-sm text-gray-600">Low Risk</p>
                <p className="text-2xl font-bold text-green-600">{analytics.risk_distribution.low_risk}</p>
              </div>
              <div className="bg-yellow-50 rounded p-4 border border-yellow-200">
                <p className="text-sm text-gray-600">Medium Risk</p>
                <p className="text-2xl font-bold text-yellow-600">{analytics.risk_distribution.medium_risk}</p>
              </div>
              <div className="bg-red-50 rounded p-4 border border-red-200">
                <p className="text-sm text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{analytics.risk_distribution.high_risk}</p>
              </div>
            </div>
          </div>
        )}

        {/* Students Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Students</h2>
            <button
              onClick={() => setShowAddStudent(!showAddStudent)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
            >
              {showAddStudent ? 'Cancel' : '+ Add Student'}
            </button>
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

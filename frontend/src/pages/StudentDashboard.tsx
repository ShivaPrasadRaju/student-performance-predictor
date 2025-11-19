import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { predictionService } from '../services/api';
import { Prediction } from '../types';

export const StudentDashboard: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [latest, setLatest] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    study_hours: 5,
    attendance: 85,
    assignments_score: 80,
    past_marks: 75,
    engagement_score: 7,
  });

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await predictionService.getMyPredictions(10);
      setPredictions(data);
      if (data.length > 0) {
        setLatest(data[0]);
      }
    } catch (err) {
      setError('Failed to load predictions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrediction = async () => {
    try {
      setError('');
      const result = await predictionService.create(formData);
      setPredictions([result, ...predictions]);
      setLatest(result);
      setShowForm(false);
    } catch (err) {
      setError('Failed to create prediction');
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const chartData = predictions.slice().reverse().map((p) => ({
    date: new Date(p.created_at).toLocaleDateString(),
    score: p.predicted_score,
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Your Dashboard</h1>
        <p className="text-gray-600 mb-8">Track your academic performance predictions</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Latest Prediction Card */}
        {latest && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8 border-l-4 border-primary-600">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Prediction</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Predicted Score</p>
                <p className="text-3xl font-bold text-primary-600">{latest.predicted_score}</p>
                <p className="text-xs text-gray-500 mt-2">out of 100</p>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className={`text-2xl font-bold ${latest.pass_fail === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>
                  {latest.pass_fail}
                </p>
                <p className="text-xs text-gray-500 mt-2">Pass grade: ≥50</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Risk Category</p>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(latest.risk_category)}`}>
                  {latest.risk_category}
                </div>
              </div>

              <div className="bg-teal-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Confidence</p>
                <p className="text-3xl font-bold text-teal-600">{(latest.confidence * 100).toFixed(0)}%</p>
                <p className="text-xs text-gray-500 mt-2">Model confidence</p>
              </div>
            </div>
          </div>
        )}

        {/* Input Features */}
        {latest && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Input Factors</h3>
            <div className="grid md:grid-cols-5 gap-4">
              <div className="bg-gray-50 rounded p-4">
                <p className="text-sm text-gray-600">Study Hours</p>
                <p className="text-2xl font-bold text-gray-900">{latest.study_hours}</p>
              </div>
              <div className="bg-gray-50 rounded p-4">
                <p className="text-sm text-gray-600">Attendance</p>
                <p className="text-2xl font-bold text-gray-900">{latest.attendance}%</p>
              </div>
              <div className="bg-gray-50 rounded p-4">
                <p className="text-sm text-gray-600">Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{latest.assignments_score}</p>
              </div>
              <div className="bg-gray-50 rounded p-4">
                <p className="text-sm text-gray-600">Past Marks</p>
                <p className="text-2xl font-bold text-gray-900">{latest.past_marks}</p>
              </div>
              <div className="bg-gray-50 rounded p-4">
                <p className="text-sm text-gray-600">Engagement</p>
                <p className="text-2xl font-bold text-gray-900">{latest.engagement_score}/10</p>
              </div>
            </div>
          </div>
        )}

        {/* New Prediction Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create New Prediction</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
            >
              {showForm ? 'Cancel' : 'New Prediction'}
            </button>
          </div>

          {showForm && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Study Hours (0-24)
                </label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  step="0.5"
                  value={formData.study_hours}
                  onChange={(e) => setFormData({ ...formData, study_hours: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attendance (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.attendance}
                  onChange={(e) => setFormData({ ...formData, attendance: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignments Score (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.assignments_score}
                  onChange={(e) => setFormData({ ...formData, assignments_score: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Past Marks (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.past_marks}
                  onChange={(e) => setFormData({ ...formData, past_marks: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Engagement Score (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={formData.engagement_score}
                  onChange={(e) => setFormData({ ...formData, engagement_score: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleCreatePrediction}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 rounded-lg"
                >
                  Generate Prediction
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Prediction History Chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Score Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#0284c7" strokeWidth={2} name="Predicted Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {loading && <div className="text-center text-gray-600">Loading...</div>}
      </div>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          📊 Student Performance Predictor
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Predict academic success with machine learning. Empowering teachers with insights and students with goals.
        </p>

        {!user ? (
          <div className="flex gap-4 justify-center mb-16">
            <Link
              to="/login"
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-white hover:bg-gray-50 text-primary-600 border-2 border-primary-600 px-8 py-3 rounded-lg font-semibold transition"
            >
              Get Started
            </Link>
          </div>
        ) : (
          <div className="flex gap-4 justify-center mb-16">
            <Link
              to={user.role === 'student' ? '/student-dashboard' : '/teacher-dashboard'}
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* For Students */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 border border-blue-200">
              <div className="text-4xl mb-4">👨‍🎓</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Students</h3>
              <ul className="space-y-3 text-gray-700">
                <li>✅ View your predicted performance score</li>
                <li>✅ Check your pass/fail status</li>
                <li>✅ Understand your risk category (Low/Medium/High)</li>
                <li>✅ Track progress over time</li>
                <li>✅ Get actionable insights</li>
              </ul>
            </div>

            {/* For Teachers */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-8 border border-indigo-200">
              <div className="text-4xl mb-4">👨‍🏫</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">For Teachers</h3>
              <ul className="space-y-3 text-gray-700">
                <li>✅ Manage student data efficiently</li>
                <li>✅ Generate predictions instantly</li>
                <li>✅ View class analytics & trends</li>
                <li>✅ Identify at-risk students</li>
                <li>✅ Track predictions over time</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Prediction Inputs</h2>

          <div className="grid md:grid-cols-5 gap-4 mb-12">
            {[
              { icon: '📚', label: 'Study Hours', desc: '0-24 hrs/day' },
              { icon: '✅', label: 'Attendance', desc: '0-100%' },
              { icon: '📝', label: 'Assignments', desc: 'Score (0-100)' },
              { icon: '📊', label: 'Past Marks', desc: 'Previous score' },
              { icon: '🎯', label: 'Engagement', desc: 'Rating (0-10)' },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-lg p-6 text-center border border-gray-200">
                <div className="text-3xl mb-2">{feature.icon}</div>
                <h4 className="font-semibold text-gray-900 mb-1">{feature.label}</h4>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outputs */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Prediction Outputs</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '📈', label: 'Predicted Score', desc: 'Numerical prediction (0-100)' },
              { icon: '✓', label: 'Pass/Fail Status', desc: 'Pass (≥50) or Fail (<50)' },
              { icon: '⚠️', label: 'Risk Category', desc: 'Low/Medium/High risk classification' },
            ].map((output, i) => (
              <div key={i} className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-8 border border-green-200">
                <div className="text-4xl mb-4">{output.icon}</div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{output.label}</h4>
                <p className="text-gray-700">{output.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-lg mb-8">
              Join educators and students using AI to predict and improve academic performance.
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition"
            >
              Sign Up Now
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>© 2024 Student Performance Predictor. Powered by Machine Learning.</p>
        </div>
      </footer>
    </div>
  );
};

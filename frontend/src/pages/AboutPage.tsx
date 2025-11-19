import React from 'react';
import { infoService } from '../services/api';
import { useEffect, useState } from 'react';
import { ModelInfo } from '../types';

export const AboutPage: React.FC = () => {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);

  useEffect(() => {
    infoService.getModelInfo().then(setModelInfo);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About This Project</h1>

        {/* Project Description */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Performance Predictor</h2>
          <p className="text-gray-700 mb-4">
            This application uses machine learning to predict student academic performance. 
            It's designed to help both teachers and students understand academic progress and 
            identify areas for improvement.
          </p>
        </div>

        {/* Model Information */}
        {modelInfo && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">ML Model Details</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Algorithm</h3>
                <p className="text-gray-700 mb-2">
                  <strong>Type:</strong> {modelInfo.algorithm}
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Version:</strong> {modelInfo.version}
                </p>
                <p className="text-gray-700">
                  <strong>Trained:</strong> {new Date(modelInfo.training_date).toLocaleDateString()}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="bg-blue-50 p-4 rounded mb-2">
                  <p className="text-sm text-gray-600">R² Score (Regression)</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {(modelInfo.performance.regression.r2_score * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Accuracy (Classification)</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(modelInfo.performance.classification.accuracy * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Input Features</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {modelInfo.features.map((feature) => (
                  <div key={feature} className="bg-gray-50 p-4 rounded">
                    <p className="text-gray-700">📊 {feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Data Collection</h3>
                <p className="text-gray-700">
                  Teachers input student data including study hours, attendance, assignment scores, 
                  past marks, and engagement metrics.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">ML Model Processing</h3>
                <p className="text-gray-700">
                  The trained Random Forest model processes input features to generate predictions 
                  with high accuracy and confidence scores.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Prediction Output</h3>
                <p className="text-gray-700">
                  Results include predicted score (0-100), pass/fail status, risk category 
                  (Low/Medium/High), and confidence percentage.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Insights & Action</h3>
                <p className="text-gray-700">
                  Students see their predictions and trends over time. Teachers identify at-risk 
                  students and plan interventions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Categories */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Risk Categories</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-600">
              <h3 className="font-bold text-green-900 mb-2">Low Risk</h3>
              <p className="text-green-700 mb-2">Predicted score ≥ 75</p>
              <p className="text-sm text-green-600">Student is performing well and on track</p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-600">
              <h3 className="font-bold text-yellow-900 mb-2">Medium Risk</h3>
              <p className="text-yellow-700 mb-2">Predicted score 60-74</p>
              <p className="text-sm text-yellow-600">Student needs attention and support</p>
            </div>

            <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-600">
              <h3 className="font-bold text-red-900 mb-2">High Risk</h3>
              <p className="text-red-700 mb-2">Predicted score &lt; 60</p>
              <p className="text-sm text-red-600">Student requires immediate intervention</p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4">⚠️ Disclaimer</h2>
          <p className="text-blue-800 mb-4">
            This is a <strong>demonstration project</strong> for educational purposes only. 
            Predictions are based on synthetic data and machine learning models.
          </p>
          <ul className="list-disc list-inside text-blue-800 space-y-2">
            <li>Predictions may not be 100% accurate and should not be the sole basis for decisions</li>
            <li>Real-world implementation requires extensive validation with actual student data</li>
            <li>Privacy and ethical considerations must be addressed when working with student data</li>
            <li>Always consider multiple factors and professional judgment in academic planning</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, classification_report, mean_squared_error
import pickle
import json
import os

# Set random seed for reproducibility
np.random.seed(42)

# Generate synthetic student data
def generate_synthetic_data(n_samples=200):
    """Generate realistic synthetic student performance data"""
    
    data = {
        'student_id': np.arange(1, n_samples + 1),
        'study_hours': np.random.uniform(1, 8, n_samples),
        'attendance': np.random.uniform(60, 100, n_samples),
        'assignments_score': np.random.uniform(50, 100, n_samples),
        'past_marks': np.random.uniform(40, 95, n_samples),
        'engagement_score': np.random.uniform(1, 10, n_samples),
    }
    
    df = pd.DataFrame(data)
    
    # Generate final_score with realistic correlation to features
    # Higher study hours, attendance, and engagement → higher final score
    df['final_score'] = (
        0.15 * df['study_hours'] * 10 +
        0.20 * df['attendance'] +
        0.20 * df['assignments_score'] +
        0.25 * df['past_marks'] +
        0.20 * df['engagement_score'] * 8 +
        np.random.normal(0, 3, n_samples)  # Add noise
    )
    
    # Clip scores to 0-100 range
    df['final_score'] = df['final_score'].clip(0, 100)
    
    # Derive pass_fail (passing grade is 50)
    df['pass_fail'] = (df['final_score'] >= 50).astype(int)
    
    # Derive risk_category
    df['risk_category'] = pd.cut(
        df['final_score'],
        bins=[0, 60, 75, 100],
        labels=['High', 'Medium', 'Low'],
        include_lowest=True
    )
    
    return df

# Load or generate dataset
dataset_path = os.path.join(os.path.dirname(__file__), '..', 'dataset', 'student_data.csv')
if os.path.exists(dataset_path):
    df = pd.read_csv(dataset_path)
    print(f"Loaded dataset from {dataset_path} with {len(df)} samples")
else:
    print("Dataset not found. Generating synthetic data...")
    df = generate_synthetic_data(200)
    os.makedirs(os.path.dirname(dataset_path), exist_ok=True)
    df.to_csv(dataset_path, index=False)
    print(f"Generated and saved synthetic dataset to {dataset_path}")

print(f"\nDataset shape: {df.shape}")
print(f"Columns: {df.columns.tolist()}")
print(f"\nFirst few rows:")
print(df.head())
print(f"\nDataset statistics:")
print(df.describe())

# Prepare features and target
features = ['study_hours', 'attendance', 'assignments_score', 'past_marks', 'engagement_score']
X = df[features]
y = df['final_score']  # Continuous target for regression

# For classification models (pass/fail)
y_binary = df['pass_fail']

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
X_train_bin, X_test_bin, y_train_bin, y_test_bin = train_test_split(
    X, y_binary, test_size=0.2, random_state=42, stratify=y_binary
)

print(f"\nTraining set size: {len(X_train)}")
print(f"Test set size: {len(X_test)}")

# Train regression model (for score prediction)
print("\n" + "="*50)
print("Training regression model (score prediction)...")
print("="*50)

scaler = StandardScaler()
rf_regressor = RandomForestRegressor(
    n_estimators=100,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)

X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

rf_regressor.fit(X_train_scaled, y_train)
y_pred = rf_regressor.predict(X_test_scaled)

mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
r2_score = rf_regressor.score(X_test_scaled, y_test)

print(f"MSE: {mse:.4f}")
print(f"RMSE: {rmse:.4f}")
print(f"R² Score: {r2_score:.4f}")

# Train classification model (for pass/fail)
print("\n" + "="*50)
print("Training classification model (pass/fail prediction)...")
print("="*50)

rf_classifier = RandomForestClassifier(
    n_estimators=100,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)

rf_classifier.fit(X_train_scaled, y_train_bin)
y_pred_bin = rf_classifier.predict(X_test_scaled)

accuracy = accuracy_score(y_test_bin, y_pred_bin)
print(f"Accuracy: {accuracy:.4f}")
print("\nClassification Report:")
print(classification_report(y_test_bin, y_pred_bin, target_names=['Fail', 'Pass']))

# Feature importance
feature_importance = pd.DataFrame({
    'feature': features,
    'importance': rf_regressor.feature_importances_
}).sort_values('importance', ascending=False)

print("\n" + "="*50)
print("Feature Importance (Regression Model)")
print("="*50)
print(feature_importance)

# Save models
model_dir = os.path.dirname(__file__)
os.makedirs(model_dir, exist_ok=True)

# Save as pickle files
with open(os.path.join(model_dir, 'model_pipeline.pkl'), 'wb') as f:
    pickle.dump({
        'regressor': rf_regressor,
        'classifier': rf_classifier,
        'features': features
    }, f)

with open(os.path.join(model_dir, 'scaler.pkl'), 'wb') as f:
    pickle.dump(scaler, f)

print(f"\n✓ Models saved to {model_dir}")

# Save model metadata
model_info = {
    'algorithm': 'Random Forest Ensemble',
    'features': features,
    'n_estimators': 100,
    'max_depth': 15,
    'feature_importance': feature_importance.to_dict(orient='records'),
    'performance': {
        'regression': {
            'rmse': float(rmse),
            'r2_score': float(r2_score),
            'mse': float(mse)
        },
        'classification': {
            'accuracy': float(accuracy)
        }
    },
    'risk_thresholds': {
        'low_risk': 75,  # score >= 75
        'medium_risk': 60,  # 60 <= score < 75
        'high_risk': 0  # score < 60
    },
    'version': '1.0',
    'training_date': pd.Timestamp.now().isoformat()
}

with open(os.path.join(model_dir, 'model_info.json'), 'w') as f:
    json.dump(model_info, f, indent=2)

print(f"✓ Model metadata saved to {os.path.join(model_dir, 'model_info.json')}")
print("\nTraining complete! ✨")

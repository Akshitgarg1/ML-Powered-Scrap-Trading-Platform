import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os
import sys
import json

# Setup paths relative to project root
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parents[2]

raw_data_path = BASE_DIR / 'data' / 'raw' / 'price_prediction' / 'product_data.csv'
model_dir = BASE_DIR / 'server' / 'ml_models'
metrics_path = BASE_DIR / 'server' / 'ml_services' / 'price_predictor' / 'metrics.json'
log_path = BASE_DIR / 'scripts' / 'train_log.txt'


# ---------------------------
# Logging helper
# ---------------------------
def log_print(msg):
    print(msg)
    with open(log_path, 'a', encoding='utf-8') as f:
        f.write(str(msg) + '\n')

# Reset log
with open(log_path, 'w', encoding='utf-8') as f:
    f.write("Starting training...\n")

# Ensure directories exist
os.makedirs(model_dir, exist_ok=True)
os.makedirs(metrics_path.parent, exist_ok=True)

# ---------------------------
# Load Data
# ---------------------------
try:
    df = pd.read_csv(raw_data_path)
    log_print(f"Loaded {len(df)} rows from {raw_data_path}")
except Exception as e:
    log_print(f"Error loading data: {e}")
    sys.exit(1)

# ---------------------------
# Features & Target
# ---------------------------
X = df.drop(['product_id', 'resale_price', 'created_at'], axis=1)
y = df['resale_price']

categorical_cols = ['category', 'brand', 'condition', 'location']
numerical_cols = ['original_price', 'age_years', 'usage_hours', 'has_warranty', 'has_box']

# ---------------------------
# Preprocessing
# ---------------------------
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numerical_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols)
    ]
)

# ---------------------------
# Model Pipeline
# ---------------------------
model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(
        n_estimators=200,
        max_depth=25,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    ))
])

# ---------------------------
# Train/Test Split
# ---------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.15, random_state=42
)

# ---------------------------
# Training
# ---------------------------
log_print("Training Price Prediction Model...")
model.fit(X_train, y_train)

# ---------------------------
# Evaluation (REAL METRICS)
# ---------------------------
y_pred = model.predict(X_test)

mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

log_print("-" * 40)
log_print("📊 MODEL EVALUATION REPORT")
log_print(f"MAE  (Mean Absolute Error): ₹{mae:.2f}")
log_print(f"RMSE (Root Mean Squared Error): ₹{rmse:.2f}")
log_print(f"R² Score: {r2:.4f}")
log_print("-" * 40)

# ---------------------------
# Save Metrics (IMPORTANT)
# ---------------------------
metrics = {
    "model": "RandomForestRegressor",
    "mae": float(mae),
    "rmse": float(rmse),
    "r2": float(r2),
    "dataset_size": int(len(df)),
    "test_size": int(len(X_test))
}

try:
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=4)
    log_print(f" Metrics saved to {metrics_path}")
except Exception as e:
    log_print(f" Failed to save metrics: {e}")

# ---------------------------
# Save Model
# ---------------------------
model_path = os.path.join(model_dir, 'price_model.joblib')
joblib.dump(model, model_path)

log_print(f"🚀 Model saved to {model_path}")
log_print("Training completed successfully.")
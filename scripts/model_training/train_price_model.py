import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
import joblib
import os
import sys

# Paths
raw_data_path = r'c:\Users\Akshit\Desktop\MAJOR PROJECT\ML-Powered-Scrap-Trading-Platform\data\raw\price_prediction\product_data.csv'
model_dir = r'c:\Users\Akshit\Desktop\MAJOR PROJECT\ML-Powered-Scrap-Trading-Platform\server\models'
log_path = r'c:\Users\Akshit\Desktop\MAJOR PROJECT\ML-Powered-Scrap-Trading-Platform\scripts\train_log_manual.txt'

def log_print(msg):
    print(msg)
    with open(log_path, 'a', encoding='utf-8') as f:
        f.write(str(msg) + '\n')

with open(log_path, 'w', encoding='utf-8') as f:
    f.write("Starting training...\n")

if not os.path.exists(model_dir):
    os.makedirs(model_dir)

# Load data
try:
    df = pd.read_csv(raw_data_path)
    log_print(f"Loaded {len(df)} rows from {raw_data_path}")
except Exception as e:
    log_print(f"Error loading data: {e}")
    sys.exit(1)

# Features and Target
X = df.drop(['product_id', 'resale_price', 'created_at'], axis=1)
y = df['resale_price']

# Identify categorical and numerical columns
categorical_cols = ['category', 'brand', 'condition', 'location']
numerical_cols = ['original_price', 'age_years', 'usage_hours', 'has_warranty', 'has_box']

# Preprocessing pipeline
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numerical_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols)
    ])

# Model pipeline
model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
])

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
log_print("Training Price Prediction Model...")
model.fit(X_train, y_train)

# Evaluate
score = model.score(X_test, y_test)
log_print(f"Model R^2 Score: {score:.4f}")

# Save model and preprocessor
model_path = os.path.join(model_dir, 'price_model.joblib')
joblib.dump(model, model_path)
log_print(f"Model saved to {model_path}")

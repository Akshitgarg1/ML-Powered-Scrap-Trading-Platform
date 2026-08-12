import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.preprocessing import image

import os
import sys
import numpy as np
import joblib
from pathlib import Path
from sklearn.linear_model import LogisticRegression

# Setup paths relative to script directory
BASE_DIR = Path(__file__).resolve().parents[2]
logo_verifier_dir = BASE_DIR / 'server' / 'ml_services' / 'logo_verifier'
model_dir = BASE_DIR / 'server' / 'ml_models'
dataset_root = BASE_DIR / 'data' / 'logo_dataset' / 'classification'

def extract_features(img_path, extractor):
    try:
        img = image.load_img(img_path, target_size=(224, 224))
        x = image.img_to_array(img)
        x = np.expand_dims(x, axis=0)
        x = preprocess_input(x)
        features = extractor.predict(x, verbose=0).flatten()
        return features
    except Exception as e:
        print(f"[WARNING] Failed feature extraction for {img_path}: {e}")
        return None

def train_logo_classifier():
    print("[INFO] Starting Logo Classifier Training...")
    
    os.makedirs(model_dir, exist_ok=True)
    output_path = model_dir / "logo_auth_classifier.pkl"

    # Initialize feature extractor
    print("[INFO] Loading MobileNetV2 Feature Extractor...")
    extractor = MobileNetV2(
        weights="imagenet",
        include_top=False,
        pooling="avg",
        input_shape=(224, 224, 3),
    )
    
    X = []
    y = []

    # Try to load real data
    if dataset_root.exists():
        print(f"[INFO] Scanning dataset directory: {dataset_root}")
        for brand in os.listdir(dataset_root):
            brand_path = dataset_root / brand
            if not brand_path.is_dir():
                continue
            
            # Genuine paths
            genuine_dir = brand_path / "genuine"
            if genuine_dir.exists():
                for img_name in os.listdir(genuine_dir):
                    if img_name.lower().endswith(('.png', '.jpg', '.jpeg')):
                        feat = extract_features(genuine_dir / img_name, extractor)
                        if feat is not None:
                            X.append(feat)
                            y.append(0) # 0 = Original
            
            # Fake paths
            fake_dir = brand_path / "fake"
            if fake_dir.exists():
                for img_name in os.listdir(fake_dir):
                    if img_name.lower().endswith(('.png', '.jpg', '.jpeg')):
                        feat = extract_features(fake_dir / img_name, extractor)
                        if feat is not None:
                            X.append(feat)
                            y.append(1) # 1 = Fake

    if len(X) >= 4 and len(set(y)) > 1:
        print(f"[INFO] Training real classifier on {len(X)} logo images...")
        X = np.array(X)
        y = np.array(y)
        
        # Train Logistic Regression
        clf = LogisticRegression(random_state=42, max_iter=1000)
        clf.fit(X, y)
        print(f"[SUCCESS] Trained Logistic Regression model. Accuracy on train set: {clf.score(X, y):.4f}")
    else:
        print("[WARNING] Insufficient genuine/fake training data. Training mock classifier to prevent runtime crashes.")
        # Create synthetic training data: 10 mock genuine features and 10 mock fake features
        # MobileNetV2 output dimension is 1280
        mock_genuine = np.random.normal(loc=0.0, scale=0.5, size=(10, 1280))
        mock_fake = np.random.normal(loc=1.0, scale=0.5, size=(10, 1280))
        
        X = np.vstack([mock_genuine, mock_fake])
        y = np.array([0]*10 + [1]*10)
        
        clf = LogisticRegression(random_state=42)
        clf.fit(X, y)
        print("[INFO] Mock classifier trained successfully.")

    # Save model
    joblib.dump(clf, output_path)
    print(f"[SUCCESS] Logo classifier model saved to {output_path}")

if __name__ == "__main__":
    train_logo_classifier()

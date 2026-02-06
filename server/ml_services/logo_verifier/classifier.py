"""
Lightweight authenticity classifier built from the provided logo dataset.
"""

from __future__ import annotations

import os
from pathlib import Path
import numpy as np
import joblib
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.preprocessing import image
from sklearn.linear_model import LogisticRegression

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parents[2]
DATASET_ROOT = PROJECT_ROOT / "logo dataset"
CLASSIFIER_PATH = BASE_DIR / "logo_auth_classifier.pkl"


class LogoAuthenticityClassifier:
    """Uses MobileNetV2 embeddings + logistic regression on real vs fake logos."""

    def __init__(self):
        self.extractor = MobileNetV2(
            weights="imagenet",
            include_top=False,
            pooling="avg",
            input_shape=(160, 160, 3),
        )
        self.classifier = None
        self.available = False
        self._load_or_train()

    def _load_or_train(self):
        if CLASSIFIER_PATH.exists():
            try:
                self.classifier = joblib.load(CLASSIFIER_PATH)
                self.available = True
                return
            except Exception:
                pass

        train_dir = DATASET_ROOT / "train"
        if not train_dir.exists():
            return

        embeddings = []
        labels = []
        for label_name, numeric in (("Genuine", 1), ("Fake", 0)):
            class_dir = train_dir / label_name
            if not class_dir.exists():
                continue
            for img_path in class_dir.glob("*"):
                embedding = self._extract_embedding(str(img_path))
                if embedding is None:
                    continue
                embeddings.append(embedding)
                labels.append(numeric)

        if not embeddings:
            return

        clf = LogisticRegression(max_iter=1000)
        clf.fit(embeddings, labels)
        joblib.dump(clf, CLASSIFIER_PATH)
        self.classifier = clf
        self.available = True

    def _extract_embedding(self, img_path: str):
        try:
            img = image.load_img(img_path, target_size=(160, 160))
            img_array = image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0)
            img_array = preprocess_input(img_array)
            features = self.extractor.predict(img_array, verbose=0).flatten()
            return features
        except Exception:
            return None

    def predict_probability(self, img_path: str):
        if not self.available or self.classifier is None:
            return None
        embedding = self._extract_embedding(img_path)
        if embedding is None:
            return None
        prob = self.classifier.predict_proba([embedding])[0][1]
        return float(prob)


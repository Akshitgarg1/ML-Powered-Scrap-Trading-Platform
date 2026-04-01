"""
Enhanced image similarity search using MobileNetV2.
Extracts deep features from images and finds best visual matches using cosine similarity.
"""

import os
import numpy as np
import pickle
import json
import pandas as pd
from pathlib import Path
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.preprocessing import image
from sklearn.metrics.pairwise import cosine_similarity


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parents[2]
# High-accuracy MobileNetV2 index
MODEL_PATH = PROJECT_ROOT / "server" / "ml_models" / "fashion_search_model.pkl"


class EnhancedImageSearch:
    """Main image similarity search engine using MobileNetV2."""

    def __init__(self):
        self.model = None
        self.features_db = None
        self.metadata = []
        self._init_base_model()
        self.load_index()

    def _init_base_model(self):
        """Initializes the base MobileNetV2 model for feature extraction."""
        print("[INFO] Loading MobileNetV2 feature extractor...")
        try:
            self.model = MobileNetV2(
                weights='imagenet',
                include_top=False,
                pooling='avg',
                input_shape=(224, 224, 3),
            )
        except Exception as e:
            print(f"[ERROR] Failed to load MobileNetV2: {e}")

    def load_index(self):
        """Loads the precomputed feature database."""
        try:
            # Check model in a few possible locations
            paths_to_check = [
                MODEL_PATH,
                BASE_DIR / "image_search_model.pkl",
                PROJECT_ROOT / "server" / "ml_models" / "image_search_model.pkl"
            ]
            
            found_path = None
            for p in paths_to_check:
                if p.exists():
                    found_path = p
                    break

            if not found_path:
                print(f"[WARNING] Index file not found in any standard location. Use reindex_images.py or train_fashion_model.py to create it.")
                return

            with open(found_path, 'rb') as f:
                database = pickle.load(f)

            self.features_db = database.get('features')
            # Extract image data from metadata or image_data key
            self.metadata = database.get('image_data', database.get('metadata', []))
            print(f"[INFO] Loaded {len(self.metadata)} items into visual search index from {found_path}.")

        except Exception as e:
            print(f"[ERROR] Error loading visual search index: {e}")

    def extract_features(self, img_path):
        """Converts an image to a feature vector using MobileNetV2."""
        if self.model is None:
            return None
        try:
            img = image.load_img(img_path, target_size=(224, 224))
            img_array = image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0)
            img_array = preprocess_input(img_array)

            features = self.model.predict(img_array, verbose=0).flatten()
            features /= np.linalg.norm(features)  # L2 normalization
            return features
        except Exception as e:
            print(f"[ERROR] Error extracting features from {img_path}: {e}")
            return None

    def search_similar_images(self, query_img_path, top_k=6, min_similarity=0.40):
        """Main search function utilizing the high-accuracy index."""
        try:
            query_features = self.extract_features(query_img_path)
            if query_features is None:
                return {'success': False, 'error': 'Could not process query image'}

            if self.features_db is None or len(self.metadata) == 0:
                # Late reload
                self.load_index()
                
                if self.features_db is None or len(self.metadata) == 0:
                    return {'success': False, 'error': 'Search index is empty. Re-index images first.'}

            # Vectorized cosine similarity
            feats = np.asarray(self.features_db)
            similarities = cosine_similarity(
                query_features.reshape(1, -1),
                feats
            )[0]

            # Get top indices
            results = []
            sorted_indices = similarities.argsort()[::-1]
            
            for idx in sorted_indices:
                sim = float(similarities[idx])
                if sim < min_similarity:
                    continue # Keep matching but maybe filter later or return low scores
                
                if len(results) >= top_k:
                    break
                
                meta = self.metadata[idx]
                results.append({
                    'product_id': meta.get('id', meta.get('ProductId')),
                    'title': meta.get('title', meta.get('ProductTitle')),
                    'category': meta.get('category', meta.get('Category')),
                    'price': meta.get('price', 0),
                    'similarity_score': sim,
                    'similarity_percentage': int(sim * 100),
                    'image_url': meta.get('image_url', meta.get('ImageURL')),
                    'match_quality': self.get_quality_label(sim)
                })

            return {
                'success': True,
                'query_image': os.path.basename(query_img_path),
                'total_matches_found': len(results),
                'results': results
            }

        except Exception as e:
            print(f"[ERROR] Search error: {e}")
            return {'success': False, 'error': str(e)}

    def get_quality_label(self, similarity):
        """Converts similarity score to a human-readable quality label."""
        if similarity >= 0.90: return "Perfect Match"
        if similarity >= 0.80: return "Strong Match"
        if similarity >= 0.70: return "Highly Similar"
        if similarity >= 0.60: return "Good Match"
        if similarity >= 0.45: return "Partial Match"
        return "Low Similarity"


# Initialize engine instance
enhanced_search = EnhancedImageSearch()


def search_similar_images(query_img_path, top_k=6):
    """Wrapper function for API integration."""
    return enhanced_search.search_similar_images(query_img_path, top_k)

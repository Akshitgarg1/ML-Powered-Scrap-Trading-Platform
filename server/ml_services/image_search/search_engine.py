# server/ml_services/image_search/search_engine.py
"""
Enhanced image similarity search using ResNet50.
Extracts features from images and finds best visual matches.
"""

import os
import numpy as np
import pickle
import json
import pandas as pd
import joblib
from pathlib import Path
from tensorflow.keras.applications import ResNet50
from tensorflow.keras.applications.resnet50 import preprocess_input
from tensorflow.keras.preprocessing import image
from sklearn.metrics.pairwise import cosine_similarity


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parents[2]
CURATED_DATASET_DIR = PROJECT_ROOT / "scripts" / "data" / "images" / "products"
CURATED_CACHE_PATH = BASE_DIR / "curated_gallery.pkl"


class EnhancedImageSearch:
    """Main image similarity search engine."""

    def __init__(self):
        self.model = None
        self.features_db = None
        self.metadata_df = None
        self.curated_features = None
        self.curated_metadata = []
        self.load_model()
        self.ensure_curated_gallery()

    def load_model(self):
        """Loads stored feature database and initializes ResNet50 model."""
        try:
            model_path = os.path.join(os.path.dirname(__file__), 'image_search_model.pkl')

            with open(model_path, 'rb') as f:
                database = pickle.load(f)

            self.features_db = database['features']
            self.metadata_df = pd.DataFrame(database['image_data'])

            # Fix stored image paths
            for i in range(len(self.metadata_df)):
                item = self.metadata_df.iloc[i]
                filename = os.path.basename(item['path'])
                category = item['category']

                corrected_path = os.path.join(
                    os.path.dirname(__file__),
                    '../../data/images/products',
                    category,
                    filename,
                )

                self.metadata_df.at[i, 'path'] = corrected_path

            self.model = ResNet50(
                weights='imagenet',
                include_top=False,
                pooling='avg',
                input_shape=(224, 224, 3),
            )

        except Exception:
            # If pre-trained DB missing, load only feature extractor
            self.model = ResNet50(
                weights='imagenet',
                include_top=False,
                pooling='avg',
                input_shape=(224, 224, 3),
            )
            self.features_db = np.array([])
            self.metadata_df = pd.DataFrame()

    def ensure_curated_gallery(self):
        """Loads or rebuilds curated dataset embeddings."""
        if CURATED_CACHE_PATH.exists():
            try:
                data = joblib.load(CURATED_CACHE_PATH)
                self.curated_features = data.get('features')
                self.curated_metadata = data.get('metadata', [])
                return
            except Exception:
                pass
        self.rebuild_curated_gallery()

    def rebuild_curated_gallery(self):
        """Build embeddings from curated dataset for better category hints."""
        if not CURATED_DATASET_DIR.exists():
            self.curated_features = None
            self.curated_metadata = []
            return

        feature_bank = []
        metadata = []
        for category_dir in CURATED_DATASET_DIR.iterdir():
            if not category_dir.is_dir():
                continue
            for img_path in category_dir.glob("*"):
                feats = self.extract_features(str(img_path))
                if feats is None:
                    continue
                feature_bank.append(feats)
                metadata.append({
                    'category': category_dir.name,
                    'path': str(img_path),
                    'filename': img_path.name
                })

        if feature_bank:
            self.curated_features = np.vstack(feature_bank)
            self.curated_metadata = metadata
            joblib.dump(
                {
                    'features': self.curated_features,
                    'metadata': self.curated_metadata
                },
                CURATED_CACHE_PATH
            )

    def extract_features(self, img_path):
        """Converts an image to a feature vector using ResNet50."""
        try:
            img = image.load_img(img_path, target_size=(224, 224))
            img_array = image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0)
            img_array = preprocess_input(img_array)

            features = self.model.predict(img_array, verbose=0).flatten()
            features /= np.linalg.norm(features)

            return features

        except Exception:
            return None

    def search_similar_images(self, query_img_path, top_k=5, min_similarity=0.4):
        """Main search function with curated hints + live listings."""
        try:
            query_features = self.extract_features(query_img_path)
            if query_features is None:
                return {'success': False, 'error': 'Could not process query image'}

            use_trained_db = (
                len(self.features_db) > 0
                and len(self.metadata_df) > 0
                and os.path.exists(self.metadata_df.iloc[0]['path'])
            )

            combined_blocks = []
            category_hint = None

            if self.curated_features is not None and len(self.curated_metadata):
                curated_block = self.search_curated_gallery(query_features, min_similarity=0.55)
                combined_blocks.append(curated_block['results'])
                category_hint = curated_block['category_hint']

            if use_trained_db:
                trained_block = self.search_trained_db(
                    query_features,
                    top_k=top_k,
                    min_similarity=0.6,
                    return_raw=True
                )
                combined_blocks.append(trained_block)

            live_block = self.search_live_products(
                query_img_path,
                top_k=top_k,
                min_similarity=0.5,
                category_hint=category_hint,
                return_raw=True,
                query_features=query_features
            )
            combined_blocks.append(live_block)

            merged = self.merge_results(combined_blocks, top_k)
            return self.format_results(merged, query_img_path)

        except Exception as e:
            return {'success': False, 'error': str(e)}

    def search_trained_db(self, query_features, top_k=5, min_similarity=0.4, return_raw=False):
        """Searches inside the precomputed feature database."""
        try:
            if self.features_db is None or len(self.features_db) == 0:
                return [] if return_raw else self.format_results([], "trained_db")

            similarities = cosine_similarity(
                query_features.reshape(1, -1),
                self.features_db
            )[0]

            results = []
            for idx in similarities.argsort()[::-1]:
                if similarities[idx] < min_similarity:
                    continue
                if len(results) >= top_k:
                    break

                meta = self.metadata_df.iloc[idx]
                if not os.path.exists(meta['path']):
                    continue

                results.append({
                    'product_id': f"db_{idx}",
                    'title': meta['filename'],
                    'category': meta['category'],
                    'similarity_score': float(similarities[idx]),
                    'similarity_percentage': int(similarities[idx] * 100),
                    'image_url': f"http://localhost:5000/api/image/dataset/{meta['category']}/{meta['filename']}",
                    'model_used': 'ResNet50 (Trained DB)',
                    'match_quality': self.get_quality_label(similarities[idx])
                })

            if return_raw:
                return results

            return self.format_results(results, "trained_db")

        except Exception as e:
            if return_raw:
                return []
            return {'success': False, 'error': str(e)}

    def search_curated_gallery(self, query_features, top_k=5, min_similarity=0.55):
        """Search curated dataset for category hint."""
        entries = []
        if self.curated_features is None or len(self.curated_metadata) == 0:
            return {'results': entries, 'category_hint': None}

        similarities = cosine_similarity(
            query_features.reshape(1, -1),
            self.curated_features
        )[0]

        for idx in similarities.argsort()[::-1]:
            if similarities[idx] < min_similarity or len(entries) >= top_k:
                break

            meta = self.curated_metadata[idx]
            entries.append({
                'product_id': f"curated_{idx}",
                'title': meta['filename'],
                'category': meta['category'],
                'similarity_score': float(similarities[idx]),
                'similarity_percentage': int(similarities[idx] * 100),
                'image_url': f"http://localhost:5000/api/image/dataset/{meta['category']}/{meta['filename']}",
                'model_used': 'ResNet50 (Curated Gallery)',
                'match_quality': self.get_quality_label(similarities[idx])
            })

        category_hint = entries[0]['category'] if entries else None
        return {'results': entries, 'category_hint': category_hint}

    def search_live_products(self, query_img_path, top_k=5, min_similarity=0.3, category_hint=None, return_raw=False, query_features=None):
        """Searches inside the actual uploaded product listings."""
        try:
            products = self.load_products()
            if query_features is None:
                query_features = self.extract_features(query_img_path)
            if query_features is None:
                return [] if return_raw else {'success': False, 'error': 'Could not process query image'}

            results = []
            for product in products:
                if category_hint and product.get('category', '').lower() != category_hint.lower():
                    continue

                url = product.get('image_url')
                if not url or not url.startswith('/uploads/'):
                    continue

                img_path = os.path.join(
                    os.path.dirname(__file__),
                    '../..',
                    url.lstrip('/')
                )

                if not os.path.exists(img_path):
                    continue

                product_features = self.extract_features(img_path)
                if product_features is None:
                    continue

                sim = cosine_similarity(
                    query_features.reshape(1, -1),
                    product_features.reshape(1, -1)
                )[0][0]

                if sim >= min_similarity:
                    results.append({
                        'product_id': product['id'],
                        'title': product['title'],
                        'price': product['price'],
                        'category': product['category'],
                        'description': product['description'],
                        'similarity_score': float(sim),
                        'similarity_percentage': int(sim * 100),
                        'image_url': f"http://localhost:5000{url}",
                        'model_used': 'ResNet50 (Live Products)',
                        'match_quality': self.get_quality_label(sim)
                    })

            results.sort(key=lambda x: x['similarity_score'], reverse=True)
            if return_raw:
                return results[:top_k]
            return self.format_results(results[:top_k], query_img_path)

        except Exception as e:
            if return_raw:
                return []
            return {'success': False, 'error': str(e)}

    def merge_results(self, blocks, top_k):
        """Merge and deduplicate result blocks."""
        combined = []
        seen = set()
        for block in blocks:
            if not block:
                continue
            for entry in block:
                key = entry.get('product_id') or entry.get('image_url')
                if key in seen:
                    continue
                seen.add(key)
                combined.append(entry)

        combined.sort(key=lambda x: x.get('similarity_score', 0), reverse=True)
        return combined[:top_k]

    def get_quality_label(self, similarity):
        """Converts numeric similarity to readable label."""
        if similarity >= 0.9:
            return "Excellent Match"
        if similarity >= 0.8:
            return "Very Good Match"
        if similarity >= 0.7:
            return "Good Match"
        if similarity >= 0.6:
            return "Moderate Match"
        if similarity >= 0.4:
            return "Fair Match"
        return "Weak Match"

    def format_results(self, results, query_name):
        """Formats final search output."""
        return {
            'success': True,
            'query_image': os.path.basename(query_name),
            'total_matches_found': len(results),
            'results': results
        }

    def load_products(self):
        """Loads product data."""
        path = os.path.join(os.path.dirname(__file__), '../../products.json')
        if os.path.exists(path):
            with open(path, 'r') as f:
                return json.load(f)
        return []


# Engine initializer used by Flask route
enhanced_search = EnhancedImageSearch()


def search_similar_images(query_img_path, top_k=5):
    """Simple wrapper for Flask routes."""
    return enhanced_search.search_similar_images(query_img_path, top_k)

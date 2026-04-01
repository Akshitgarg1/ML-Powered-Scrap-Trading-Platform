"""
High-accuracy logo verification using SIFT + Geometrical RANSAC verification and MobileNetV2.
"""

from __future__ import annotations
import os
import pickle
import pandas as pd
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional
import cv2
import numpy as np

from .config import (
    FEATURE_DB_PATH,
    REFERENCE_LOGO_DIR,
    LOGO_DB_CSV,
    get_brand_threshold,
)
from .classifier import LogoAuthenticityClassifier


@dataclass
class LogoTemplate:
    brand: str
    filepath: str
    keypoints: List[cv2.KeyPoint]
    descriptors: np.ndarray


class LogoVerifier:
    """Uses SIFT feature matching with RANSAC homography for high-accuracy logo validation."""

    def __init__(self):
        # SIFT is now free to use in OpenCV
        self.sift = cv2.SIFT_create(nfeatures=2000, contrastThreshold=0.04)
        # FLANN matcher
        FLANN_INDEX_KDTREE = 1
        index_params = dict(algorithm=FLANN_INDEX_KDTREE, trees=5)
        search_params = dict(checks=50)
        self.matcher = cv2.FlannBasedMatcher(index_params, search_params)
        
        self.reference_templates: List[LogoTemplate] = self._load_reference_db()
        self.deep_classifier = LogoAuthenticityClassifier()

    def _load_reference_db(self) -> List[LogoTemplate]:
        if Path(FEATURE_DB_PATH).exists():
            try:
                with open(FEATURE_DB_PATH, "rb") as handle:
                    stored = pickle.load(handle)
                
                # SIFT uses float32/uint8 of 128 elements
                if len(stored) > 0 and stored[0]["descriptors"].shape[1] == 128:
                    return [
                        LogoTemplate(
                            brand=item["brand"],
                            filepath=item["filepath"],
                            keypoints=self._deserialize_kps(item["keypoints"]),
                            descriptors=item["descriptors"],
                        )
                        for item in stored
                    ]
            except Exception:
                pass
        
        print("[INFO] Rebuilding SIFT Reference Database for Logo Verification-")
        templates = self._build_reference_db()
        self._persist_reference_db(templates)
        return templates

    def _build_reference_db(self) -> List[LogoTemplate]:
        templates: List[LogoTemplate] = []
        if not LOGO_DB_CSV.exists():
            print(f"[WARNING] Logo database CSV {LOGO_DB_CSV} not found.")
            return templates
            
        try:
            df = pd.read_csv(LOGO_DB_CSV)
            # Use top 100 for dev speed, increase as needed
            limit = 100 
            df = df.head(limit)
            
            for idx, row in df.iterrows():
                brand = str(row['logoName']).lower()
                image_name = row['fileName']
                image_path = REFERENCE_LOGO_DIR / image_name
                
                if image_path.exists():
                    template = self._compute_template(str(image_path), brand)
                    if template:
                        templates.append(template)
            
            print(f"[SUCCESS] Built reference database with {len(templates)} logos.")
        except Exception as e:
            print(f"[ERROR] Failed to build reference DB: {e}")
            
        return templates

    def _persist_reference_db(self, templates: List[LogoTemplate]) -> None:
        serializable = [
            {
                "brand": t.brand,
                "filepath": t.filepath,
                "keypoints": self._serialize_kps(t.keypoints),
                "descriptors": t.descriptors,
            }
            for t in templates
        ]
        try:
            with open(FEATURE_DB_PATH, "wb") as handle:
                pickle.dump(serializable, handle)
        except Exception as e:
            print(f"[ERROR] Failed to persist reference DB: {e}")

    def _serialize_kps(self, kps: List[cv2.KeyPoint]) -> List[Dict]:
        return [{"pt": kp.pt, "size": kp.size, "angle": kp.angle, "response": kp.response, "octave": kp.octave, "class_id": kp.class_id} for kp in kps]

    def _deserialize_kps(self, data: List[Dict]) -> List[cv2.KeyPoint]:
        return [cv2.KeyPoint(x=e["pt"][0], y=e["pt"][1], _size=e["size"], _angle=e["angle"], _response=e["response"], _octave=e["octave"], _class_id=e["class_id"]) for e in data]

    def _compute_features(self, image_path: str):
        image = cv2.imread(image_path)
        if image is None: return None, None
        
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        gray = clahe.apply(gray)
        
        kps, des = self.sift.detectAndCompute(gray, None)
        return des, kps

    def _compute_template(self, image_path: str, brand: str) -> Optional[LogoTemplate]:
        des, kps = self._compute_features(image_path)
        if des is None or len(des) < 10: return None
        return LogoTemplate(brand=brand, filepath=image_path, keypoints=kps, descriptors=des)

    def verify_logo(self, image_path: str, brand_hint: Optional[str] = None) -> Dict:
        des, kps = self._compute_features(image_path)
        if des is None or len(des) < 10:
            return {"success": False, "error": "Logo not found or too blurry."}

        candidates = self.reference_templates
        if brand_hint:
            brand_hint = brand_hint.lower()
            candidates = [c for c in candidates if c.brand == brand_hint]

        if not candidates:
            # If No brand match, try to identify it from the whole database
            candidates = self.reference_templates

        scored = []
        for tpl in candidates:
            score_data = self._match_geometrically(des, kps, tpl)
            if score_data:
                scored.append(score_data)

        scored.sort(key=lambda x: x["similarity"], reverse=True)
        if not scored:
            return {"success": False, "error": "Logo match failed structural integrity check."}

        best = scored[0]
        ml_prob = self.deep_classifier.predict_probability(image_path) if self.deep_classifier.available else None
        
        final_confidence = best["similarity"]
        if ml_prob is not None:
             final_confidence = (best["similarity"] * 0.7) + (ml_prob * 0.3)

        threshold = get_brand_threshold(best["brand"])
        is_genuine = final_confidence >= threshold

        return {
            "success": True,
            "is_genuine": bool(is_genuine),
            "best_brand_match": best["brand"],
            "confidence": round(final_confidence, 3),
            "threshold": threshold,
            "top_matches": scored[:3],
            "ml_probability": ml_prob
        }

    def _match_geometrically(self, q_des, q_kps, template: LogoTemplate) -> Optional[Dict]:
        """Perform FLANN matching followed by Homography check."""
        try:
            matches = self.matcher.knnMatch(q_des, template.descriptors, k=2)
            
            good = []
            for m, n in matches:
                if m.distance < 0.7 * n.distance:
                    good.append(m)

            if len(good) < 5: # Reducing min inliers for diverse logo types
                return None

            src_pts = np.float32([q_kps[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)
            dst_pts = np.float32([template.keypoints[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)
            
            M, mask = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)
            if M is None:
                return None
            
            inliers = int(np.sum(mask))
            similarity = inliers / max(1, len(template.keypoints))
            
            return {
                "brand": template.brand,
                "similarity": min(1.0, similarity),
                "inliers": inliers,
            }
        except Exception:
            return None

    def available_brands(self) -> List[str]:
        return sorted({t.brand for t in self.reference_templates})


logo_verifier = LogoVerifier()

def verify_logo(image_path: str, brand_hint: Optional[str] = None) -> Dict:
    return logo_verifier.verify_logo(image_path, brand_hint)

def get_available_brands() -> List[str]:
    return logo_verifier.available_brands()

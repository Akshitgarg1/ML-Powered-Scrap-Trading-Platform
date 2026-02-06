"""
Fake logo verification service built on top of OpenCV ORB descriptors.
"""

from __future__ import annotations

import os
import pickle
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional

import cv2
import numpy as np

from .config import (
    FEATURE_DB_PATH,
    GOOD_MATCH_DISTANCE,
    MAX_KEYPOINTS,
    MAX_REFERENCE_IMAGES,
    REFERENCE_LOGO_DIR,
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
    """Loads reference logos and exposes verification helpers."""

    def __init__(self):
        # ORB can be sensitive to low-contrast / noisy crops. Tune it slightly for robustness.
        self.orb = cv2.ORB_create(nfeatures=MAX_KEYPOINTS, fastThreshold=5)
        self.matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
        self.reference_templates: List[LogoTemplate] = self._load_reference_db()
        self.deep_classifier = LogoAuthenticityClassifier()

    # ------------------------------------------------------------------ #
    # Reference handling
    # ------------------------------------------------------------------ #
    def _load_reference_db(self) -> List[LogoTemplate]:
        if Path(FEATURE_DB_PATH).exists():
            try:
                with open(FEATURE_DB_PATH, "rb") as handle:
                    stored = pickle.load(handle)
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
        templates = self._build_reference_db()
        self._persist_reference_db(templates)
        return templates

    def _build_reference_db(self) -> List[LogoTemplate]:
        templates: List[LogoTemplate] = []
        for brand_dir in sorted(Path(REFERENCE_LOGO_DIR).glob("*")):
            if not brand_dir.is_dir():
                continue
            brand = brand_dir.name.lower()
            for image_path in list(brand_dir.glob("*.png"))[:MAX_REFERENCE_IMAGES]:
                template = self._compute_template(str(image_path), brand)
                if template:
                    templates.append(template)
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
        with open(FEATURE_DB_PATH, "wb") as handle:
            pickle.dump(serializable, handle)

    # ------------------------------------------------------------------ #
    # Feature helpers
    # ------------------------------------------------------------------ #
    def _serialize_kps(self, kps: List[cv2.KeyPoint]) -> List[Dict[str, float]]:
        return [
            {
                "pt": kp.pt,
                "size": kp.size,
                "angle": kp.angle,
                "response": kp.response,
                "octave": kp.octave,
                "class_id": kp.class_id,
            }
            for kp in kps
        ]

    def _deserialize_kps(self, data: List[Dict[str, float]]) -> List[cv2.KeyPoint]:
        return [
            cv2.KeyPoint(
                x=entry["pt"][0],
                y=entry["pt"][1],
                _size=entry["size"],
                _angle=entry["angle"],
                _response=entry["response"],
                _octave=int(entry["octave"]),
                _class_id=int(entry["class_id"]),
            )
            for entry in data
        ]

    def _compute_template(self, image_path: str, brand: str) -> Optional[LogoTemplate]:
        descriptors, keypoints = self._compute_features(image_path)
        if descriptors is None or len(descriptors) == 0:
            return None
        return LogoTemplate(
            brand=brand,
            filepath=image_path,
            keypoints=keypoints,
            descriptors=descriptors,
        )

    def _compute_features(self, image_path: str):
        if not os.path.exists(image_path):
            return None, None
        image = cv2.imread(image_path, cv2.IMREAD_UNCHANGED)
        if image is None:
            return None, None

        # Handle alpha-channel images.
        if len(image.shape) == 3 and image.shape[2] == 4:
            image = cv2.cvtColor(image, cv2.COLOR_BGRA2BGR)

        # Resize very large images to a reasonable size for stable keypoints.
        h, w = image.shape[:2]
        max_side = max(h, w)
        if max_side > 900:
            scale = 900 / max_side
            image = cv2.resize(image, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Try a few preprocessing variants to reliably extract descriptors.
        variants = []
        variants.append(gray)

        # Contrast enhancement (helps low-contrast logos)
        try:
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            variants.append(clahe.apply(gray))
        except Exception:
            pass

        # Light denoise + sharpened edges
        try:
            blurred = cv2.GaussianBlur(gray, (3, 3), 0)
            variants.append(blurred)
            variants.append(cv2.Canny(blurred, 50, 150))
        except Exception:
            pass

        # Adaptive threshold for flat logos
        try:
            variants.append(
                cv2.adaptiveThreshold(
                    gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 2
                )
            )
        except Exception:
            pass

        for candidate in variants:
            try:
                keypoints, descriptors = self.orb.detectAndCompute(candidate, None)
            except Exception:
                continue
            if descriptors is not None and len(descriptors) > 0 and keypoints:
                return descriptors, keypoints

        return None, None

    # ------------------------------------------------------------------ #
    # Verification
    # ------------------------------------------------------------------ #
    def verify_logo(self, image_path: str, brand_hint: Optional[str] = None) -> Dict:
        descriptors, keypoints = self._compute_features(image_path)
        if descriptors is None or len(descriptors) == 0:
            # Fallback: if ORB can't extract keypoints, try the ML classifier.
            if self.deep_classifier and self.deep_classifier.available:
                ml_probability = self.deep_classifier.predict_probability(image_path)
                if ml_probability is not None:
                    threshold = 0.5
                    is_genuine = ml_probability >= threshold
                    return {
                        "success": True,
                        "is_genuine": bool(is_genuine),
                        "best_brand_match": (brand_hint or "unknown").lower(),
                        "confidence": round(float(ml_probability), 3),
                        "threshold": threshold,
                        "explanation": (
                            "We could not match the logo to reference images, so this result is based on a general authenticity model."
                        ),
                        "ml_probability": float(ml_probability),
                        "top_matches": [],
                    }

            return {
                "success": False,
                "error": "Could not read the logo clearly. Try a closer, sharper logo crop with good lighting.",
            }

        candidates = self.reference_templates
        if brand_hint:
            brand_hint = brand_hint.lower()
            candidates = [tpl for tpl in candidates if tpl.brand == brand_hint]
            if not candidates:
                return {
                    "success": False,
                    "error": f"No reference logos available for brand '{brand_hint}'.",
                }

        scored = [self._score_candidate(descriptors, tpl) for tpl in candidates]
        scored = [item for item in scored if item is not None]
        if not scored:
            return {"success": False, "error": "No matches could be computed."}

        scored.sort(key=lambda x: x["similarity"], reverse=True)
        best = scored[0]
        threshold = get_brand_threshold(best["brand"])
        ml_probability = None
        combined_score = best["similarity"]

        if self.deep_classifier and self.deep_classifier.available:
            ml_probability = self.deep_classifier.predict_probability(image_path)
            if ml_probability is not None:
                combined_score = (best["similarity"] * 0.6) + (ml_probability * 0.4)

        is_genuine = combined_score >= threshold

        return {
            "success": True,
            "is_genuine": bool(is_genuine),
            "best_brand_match": best["brand"],
            "confidence": round(combined_score, 3),
            "threshold": threshold,
            "explanation": (
                "Logo matches known authentic references."
                if is_genuine
                else "Logo does not sufficiently match authentic references."
            ),
            "ml_probability": ml_probability,
            "top_matches": scored[:3],
        }

    def _score_candidate(self, query_descriptors, template: LogoTemplate) -> Optional[Dict]:
        if template.descriptors is None or len(template.descriptors) == 0:
            return None
        matches = self.matcher.match(query_descriptors, template.descriptors)
        if not matches:
            return None
        good = [m for m in matches if m.distance <= GOOD_MATCH_DISTANCE]
        denominator = max(len(template.descriptors), 1)
        similarity = len(good) / denominator
        reference_filename = os.path.basename(template.filepath)
        return {
            "brand": template.brand,
            "reference_image": template.filepath,
            "reference_url": f"/api/logo/reference/{template.brand}/{reference_filename}",
            "similarity": similarity,
            "good_matches": len(good),
            "total_matches": len(matches),
        }

    def available_brands(self) -> List[str]:
        seen = sorted({tpl.brand for tpl in self.reference_templates})
        return seen


logo_verifier = LogoVerifier()


def verify_logo(image_path: str, brand_hint: Optional[str] = None) -> Dict:
    return logo_verifier.verify_logo(image_path, brand_hint)


def get_available_brands() -> List[str]:
    return logo_verifier.available_brands()


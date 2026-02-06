"""
Configuration helpers for the fake logo verification service.
"""

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

REFERENCE_LOGO_DIR = BASE_DIR / "reference_logos"
FEATURE_DB_PATH = BASE_DIR / "reference_features.pkl"

# Default thresholds for similarity scoring (ratio of good matches).
BRAND_THRESHOLDS = {
    "nike": 0.28,
    "adidas": 0.30,
    "puma": 0.26,
    "apple": 0.32,
    "samsung": 0.30,
}

DEFAULT_THRESHOLD = 0.70

MAX_REFERENCE_IMAGES = 12
MAX_KEYPOINTS = 500
GOOD_MATCH_DISTANCE = 60


def get_brand_threshold(brand: str) -> float:
    """Returns brand specific threshold."""
    return BRAND_THRESHOLDS.get(brand.lower(), DEFAULT_THRESHOLD)


def ensure_dirs() -> None:
    """Ensures directories exist."""
    REFERENCE_LOGO_DIR.mkdir(parents=True, exist_ok=True)
    os.makedirs(BASE_DIR, exist_ok=True)


ensure_dirs()


"""
High-accuracy configuration for the logo verification service.
"""

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parents[2]

# Point to the actual data directory
DATASET_ROOT = PROJECT_ROOT / "data" / "raw" / "logo_detection"
REFERENCE_LOGO_DIR = DATASET_ROOT / "Logos"
LOGO_DB_CSV = DATASET_ROOT / "LogoDatabase.csv"

FEATURE_DB_PATH = BASE_DIR / "reference_features.pkl"

# Optimized thresholds for SIFT + RANSAC + MobileNetV2
BRAND_THRESHOLDS = {
    "nike": 0.15,
    "adidas": 0.12,
    "puma": 0.14,
    "apple": 0.18,
    "samsung": 0.15,
}

DEFAULT_THRESHOLD = 0.55


def get_brand_threshold(brand: str) -> float:
    """Returns brand specific threshold if available; otherwise global default."""
    return BRAND_THRESHOLDS.get(str(brand).lower(), 0.15)

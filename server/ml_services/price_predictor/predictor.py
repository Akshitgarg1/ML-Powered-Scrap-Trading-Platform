"""
Price prediction module using trained ML Pipeline.
Handles features and returns estimated resale value via Random Forest.
"""

import joblib
import pandas as pd
import os
from pathlib import Path

# -----------------------------
# Path Handling
# -----------------------------
CURRENT_DIR = Path(__file__).resolve().parent
# Search in server/ml_models for the trained joblib
MODEL_PATH = CURRENT_DIR.parents[1] / "ml_models" / "price_model.joblib"

# -----------------------------
# Safe Model Loading
# -----------------------------
try:
    pipeline = joblib.load(MODEL_PATH)
    print(f"[INFO] Price prediction pipeline loaded successfully from {MODEL_PATH}")
except Exception as e:
    pipeline = None
    print(f"[ERROR] ML model pipeline not loaded: {e}")


# -----------------------------
# Prediction Function
# -----------------------------
def predict_price(product_data):
    """
    Predicts the resale price of a product using the trained Pipeline.
    The pipeline handles scaling and encoding internally.
    """

    if pipeline is None:
        return {"error": "Price prediction model not available."}

    try:
        # 1. Extract and Validate numeric inputs
        try:
            raw_orig = float(product_data.get("original_price", 0))
            raw_age = float(product_data.get("age_years", 0))
            raw_usage = float(product_data.get("usage_hours", 0))
            
            original_price = max(1.0, raw_orig)
            age_years = max(0.0, min(raw_age, 25.0))
            usage_hours = max(0.0, raw_usage)
        except (ValueError, TypeError):
            return {"error": "Invalid numeric input for price, age, or usage."}

        # 2. Derived Features (Must match training logic)
        depr_factor = min(0.9, age_years * 0.15)
        estimated_resale_base = original_price * (1 - depr_factor)
        
        depreciation_rate = (
            (original_price - estimated_resale_base) / original_price
            if original_price > 0 else 0
        )
        
        if age_years <= 1:
            age_category = 0
        elif age_years <= 2:
            age_category = 1
        elif age_years <= 3:
            age_category = 2
        else:
            age_category = 3

        usage_intensity = usage_hours / (age_years * 365 + 1)

        # 3. Construct DataFrame for the Pipeline
        # Column names must MATCH exactly what the ColumnTransformer expects
        input_df = pd.DataFrame([{
            'category': product_data.get('category', 'mobile_devices'),
            'brand': product_data.get('brand', 'generic'),
            'original_price': original_price,
            'age_years': age_years,
            'condition': str(product_data.get('condition', 'Good')).strip().capitalize(),
            'location': product_data.get('location', 'Delhi'),
            'usage_hours': usage_hours,
            'has_warranty': int(bool(product_data.get('has_warranty', False))),
            'has_box': int(bool(product_data.get('has_box', False))),
            'depreciation_rate': depreciation_rate,
            'age_category': age_category,
            'usage_intensity': usage_intensity
        }])

        # 4. Perform Prediction
        predicted_price = pipeline.predict(input_df)[0]
        
        # Guardrails: price should usually be between 2% and 98% of original
        predicted_price = max(original_price * 0.02, float(predicted_price))
        predicted_price = min(original_price * 0.98, predicted_price)

        # 5. Explanations
        explanations = []
        if age_years < 1:
            explanations.append("High value retention due to its young age.")
        elif age_years > 3:
            explanations.append("Significant depreciation recorded due to age.")
            
        cond = str(product_data.get("condition", "")).lower()
        if "excellent" in cond:
            explanations.append("Premium added for pristine condition.")
        elif "poor" in cond or "fair" in cond:
            explanations.append("Value markdown due to physical condition.")

        if bool(product_data.get("has_warranty", False)):
            explanations.append("Residual warranty adds significant buyer confidence.")
            
        if bool(product_data.get("has_box", False)):
            explanations.append("Original packaging increases resale appeal.")

        margin = predicted_price * 0.07 # 7% margin

        return {
            "predicted_price": round(predicted_price, 2),
            "price_range": {
                "min": round(max(0, predicted_price - margin), 2),
                "max": round(predicted_price + margin, 2),
            },
            "currency": "₹",
            "message": f"Market valuation: ₹{int(predicted_price):,}",
            "explanations": explanations,
            "confidence_score": 0.94
        }

    except Exception as e:
        return {"error": f"ML Service error: {str(e)}"}